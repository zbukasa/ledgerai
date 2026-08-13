
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Type } from '@google/genai';
import { aiService } from '../services/apiService';
import { Transaction, AIProposal, InventoryItem, InventoryProduct, AIInsightCache } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCategories } from '../contexts/CategoryContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { dataService } from '../services/dataService';
import { db } from '../services/syncService';
import { v4 as uuidv4 } from 'uuid';

export const useAIInsight = (transactions: Transaction[], inventory: InventoryItem[] = [], products: InventoryProduct[] = []) => {
    const [proposals, setProposals] = useState<AIProposal[]>([]);
    const [appliedProposals, setAppliedProposals] = useState<AIProposal[]>([]);
    const [insightText, setInsightText] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const lastScanFingerprint = useRef<string>('');

    const { preferredCurrency, convertAmount } = useCurrency();
    const { categories, addCategory } = useCategories();
    const { business, currentUser } = useAuth();
    const { t, language } = useLanguage();

    // Create a robust fingerprint of the data to detect meaningful changes
    const dataFingerprint = useMemo(() => {
        // Use count, total, and a sample of transactions to be reasonably sure of changes
        const sample = [...transactions.slice(0, 15), ...transactions.slice(-5)];
        const sampleStr = sample.map(t => `${t.id}-${t.categoryId}-${t.amount}`).join('|');
        const inventoryStr = inventory.map(i => `${i.productType}-${i.totalQuantity}`).join('|');
        return `${language}|${transactions.length}|${sampleStr}|${inventoryStr}`;
    }, [transactions, language, inventory]);

    useEffect(() => {
        const loadInitialData = async () => {
            // Load applied proposals history
            const history = await db.aiProposals.where('status').equals('applied').reverse().sortBy('appliedAt');
            setAppliedProposals(history);

            // Load cached insight if available
            const cached = await db.aiInsights.get('current');
            if (cached && cached.fingerprint === dataFingerprint) {
                setInsightText(cached.narrative);
                setProposals(cached.proposals);
                lastScanFingerprint.current = cached.fingerprint;
                setLoading(false);
            } else {
                // If no cache or mismatch, we'll let the useEffect trigger generateInsight
                setLoading(true);
            }
        };
        loadInitialData();
    }, [dataFingerprint]);

    const generateInsight = useCallback(async (currentTransactions: Transaction[], force: boolean = false) => {
        if (currentTransactions.length < 3) {
            setLoading(false);
            setInsightText(t('insights.notEnoughTransactions'));
            return;
        }

        // Smart triggering: Only scan if data changed or forced
        if (!force && dataFingerprint === lastScanFingerprint.current) {
            setLoading(false);
            return;
        }

        // Check cache one more time before calling API (in case it was updated by another component)
        if (!force) {
            const cached = await db.aiInsights.get('current');
            if (cached && cached.fingerprint === dataFingerprint) {
                setInsightText(cached.narrative);
                setProposals(cached.proposals);
                lastScanFingerprint.current = cached.fingerprint;
                setLoading(false);
                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            // Load already handled proposals to avoid duplicates
            const handledProposals = await db.aiProposals.toArray();
            const handledTitles = handledProposals.map(p => p.title);

            // Provide context for the AI - including more recent items for better classification
            const txSummary = currentTransactions.slice(0, 60).map(t => ({
                id: t.id,
                item: t.item,
                amount: t.amount,
                currency: t.currency,
                type: t.type,
                category: categories.find(c => c.id === t.categoryId)?.name || 'Other'
            }));

            const categorySchema = categories.map(c => ({ id: c.id, name: c.name }));

            const inventorySummary = products.map(p => {
                const inv = inventory.find(i => i.productType === p.name);
                return {
                    name: p.name,
                    unit: p.unit,
                    currentStock: inv?.totalQuantity || 0
                };
            });

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    narrative: { 
                        type: Type.STRING, 
                        description: "A professional and encouraging financial analysis of the current spending and income patterns (2-3 sentences)." 
                    },
                    proposals: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, description: "The action type: reclassify, create_category, or optimization." },
                                title: { type: Type.STRING, description: "Short title for the action." },
                                description: { type: Type.STRING, description: "Detailed explanation." },
                                impact: { type: Type.STRING, description: "Expected financial benefit." },
                                proposedValue: { 
                                    type: Type.STRING, 
                                    description: "If reclassify: category ID. If create_category: new category name." 
                                },
                                proposedType: {
                                    type: Type.STRING,
                                    description: "If the transaction type should change (e.g., from expense to income), specify 'income' or 'expense'."
                                },
                                affectedTransactionIds: { 
                                    type: Type.ARRAY, 
                                    items: { type: Type.STRING },
                                    description: "List of transaction IDs to update."
                                }
                            },
                            propertyOrdering: ['type', 'title', 'description', 'impact', 'proposedValue', 'proposedType', 'affectedTransactionIds']
                        }
                    }
                },
                propertyOrdering: ['narrative', 'proposals']
            };

            const languageNames: Record<string, string> = {
                en: 'English',
                fr: 'French',
                ln: 'Lingala',
                sw: 'Swahili'
            };
            const targetLanguage = languageNames[language] || 'English';

            const prompt = `
                Analyze these transactions for "${business?.name || 'this business'}".
                Business Context: ${business?.businessType ? `Type: ${business.businessType}.` : ''} ${business?.description ? `Description: ${business.description}.` : ''}
                Return a narrative analysis and a list of structured action proposals.
                
                Categories (Use these IDs for 'reclassify'): ${JSON.stringify(categorySchema)}
                Inventory Levels: ${JSON.stringify(inventorySummary)}
                Recent Transactions: ${JSON.stringify(txSummary)}

                IMPORTANT: 
                1. Respond ENTIRELY in ${targetLanguage}. All text fields (narrative, title, description, impact) MUST be in ${targetLanguage}.
                2. DO NOT suggest any of the following improvements as they have already been handled or dismissed:
                ${JSON.stringify(handledTitles)}

                Rules:
                1. Narrative: Mention specific merchants or categories. Use a tone of a trusted CFO.
                2. Proposals: Suggest moving items out of "Other" if they clearly match a category like "Fuel" or "Materials".
                3. Proposals: Suggest creating a new category if you see a pattern (e.g. many "Groceries" or "Travel" entries).
                4. LOW STOCK: If any inventory item is low (e.g., less than 100 blocks or 5 bags), create an 'optimization' proposal to restock.
                5. RECURRING TRIPS: Look for patterns in vehicle logs (kilometers > 0). If a trip to a specific destination (item/merchant) happens repeatedly on the same day of the week, but is missing for the current week, create an 'optimization' proposal to nudge the user.
                   - Title: "Forgotten Trip?"
                   - Description: "I noticed you usually go to [Destination] on [Day], but I don't see a log for today. Did you do that trip?"
                   - Impact: "Log this to save approximately [Amount] in tax deductions."
                   - proposedValue: A JSON string like {"item": "[Destination]", "kilometers": [Distance], "usageType": "business"}
                6. TAX SAVINGS: Calculate potential tax savings from business kilometers (assume $0.65/km). Mention this in the narrative if significant.
                7. CASH FLOW: Look for upcoming recurring patterns and warn if expenses are outpacing income.
                8. INCOME VS EXPENSE: Pay close attention to merchants like "Uber", "Lyft", "DoorDash", or "Stripe". 
                   - If the business is a gig worker (e.g. Uber Driver), these are likely 'income'.
                   - If the business is a construction firm, Uber might be a 'transport' expense for workers.
                   - Use the business context provided above to make the best judgment.
                9. Output valid JSON.
            `;
            
            const responseText = await aiService.generate({
                model: 'gemini-3-flash-preview',
                contents: [{ parts: [{ text: prompt }] }],
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: responseSchema
                },
                metric: 'aiInsights',
            });

            const result = JSON.parse(responseText || '{}');
            setInsightText(result.narrative || '');
            
            // Filter out any proposals that the AI might have suggested despite the prompt instructions
            const newProposals = (result.proposals || [])
                .filter((p: any) => !handledTitles.includes(p.title))
                .map((p: any) => ({ ...p, id: uuidv4(), status: 'pending' }));
                
            setProposals(newProposals);
            lastScanFingerprint.current = dataFingerprint;

            // Cache the result
            await db.aiInsights.put({
                id: 'current',
                fingerprint: dataFingerprint,
                narrative: result.narrative || '',
                proposals: newProposals,
                timestamp: Date.now()
            });
            
        } catch (e) {
            console.error("AI Insight Error:", e);
            setError(t('insights.insightError'));
        } finally {
            setLoading(false);
        }
    }, [categories, business, t, language, dataFingerprint]);

    const applyProposal = async (proposal: AIProposal) => {
        try {
            const appliedProposal = { 
                ...proposal, 
                status: 'applied' as const, 
                appliedAt: Date.now() 
            };

            if (proposal.type === 'reclassify' && proposal.affectedTransactionIds) {
                // Update each transaction in the DB
                for (const id of proposal.affectedTransactionIds) {
                    const tx = transactions.find(t => t.id === id);
                    if (tx) {
                        const updates: Partial<Transaction> = {};
                        if (proposal.proposedValue) updates.categoryId = proposal.proposedValue;
                        if (proposal.proposedType) updates.type = proposal.proposedType;
                        
                        await dataService.updateTransaction({
                            ...tx,
                            ...updates
                        });
                    }
                }
            } else if (proposal.type === 'create_category' && proposal.proposedValue) {
                // Create the new category. Ensure we handle if proposedValue is a string or object
                const catName = typeof proposal.proposedValue === 'string' 
                    ? proposal.proposedValue 
                    : (proposal.proposedValue as any).name;
                
                const catIcon = (proposal.proposedValue as any).icon || 'Package';
                
                await addCategory(catName, catIcon);
            } else if (proposal.type === 'optimization' && proposal.title === "Forgotten Trip?" && proposal.proposedValue) {
                // Log the trip
                try {
                    const tripData = typeof proposal.proposedValue === 'string' 
                        ? JSON.parse(proposal.proposedValue) 
                        : proposal.proposedValue;
                    
                    if (tripData.item && tripData.kilometers) {
                        await dataService.createTransaction({
                            id: crypto.randomUUID(),
                            date: new Date(),
                            amount: 0, // Trip logs often have 0 direct cost but high tax value
                            currency: preferredCurrency,
                            item: tripData.item,
                            categoryId: 'transport', // Default to transport
                            type: 'expense',
                            kilometers: tripData.kilometers,
                            usageType: tripData.usageType || 'business',
                            userId: currentUser?.id || 'default',
                            businessId: business?.id
                        });
                    }
                } catch (e) {
                    console.error("Failed to parse trip nudge data", e);
                }
            }
            
            // Persist the applied proposal
            await db.aiProposals.put(appliedProposal);
            setAppliedProposals(prev => {
                // Prevent duplicates
                if (prev.some(p => p.id === appliedProposal.id)) return prev;
                return [appliedProposal, ...prev];
            });

            // Remove the applied proposal from the current list immediately
            setProposals(prev => prev.filter(p => p.id !== proposal.id));
            
            // IMPORTANT: Regenerate insight to reflect the data changes in the narrative
            // We wait a tiny bit to ensure state updates have propagated
            setTimeout(() => {
                generateInsight(transactions);
            }, 500);

            return true;
        } catch (e) {
            console.error("Failed to apply proposal", e);
            return false;
        }
    };

    const dismissProposal = async (proposal: AIProposal) => {
        try {
            const dismissedProposal = { 
                ...proposal, 
                status: 'dismissed' as const, 
                appliedAt: Date.now() 
            };
            await db.aiProposals.put(dismissedProposal);
            setProposals(prev => prev.filter(p => p.id !== proposal.id));
            return true;
        } catch (e) {
            console.error("Failed to dismiss proposal", e);
            return false;
        }
    };

    const clearHistory = async () => {
        try {
            await db.aiProposals.where('status').equals('applied').delete();
            setAppliedProposals([]);
            return true;
        } catch (e) {
            console.error("Failed to clear history", e);
            return false;
        }
    };

    useEffect(() => {
        generateInsight(transactions);
    }, [dataFingerprint, generateInsight, transactions, inventory]); 

    return { 
        proposals, 
        appliedProposals,
        insightText, 
        loading, 
        error, 
        regenerateInsight: () => generateInsight(transactions, true), 
        applyProposal,
        dismissProposal,
        clearHistory
    };
};
