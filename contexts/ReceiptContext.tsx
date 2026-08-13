
import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { Type } from '@google/genai';
import { ParsedTransaction, ImageInput, Transaction } from '../types';
import { useCategories } from './CategoryContext';
import { useLanguage } from './LanguageContext';
import { useCurrency } from './CurrencyContext';
import { useAuth } from './AuthContext';
import { blobToBase64 } from '../utils/helpers';
import { v4 as uuidv4 } from 'uuid';
import { useNotification } from './NotificationContext';
import { generateTransactionPayload } from '../services/hashUtils';
import { aiService } from '../services/apiService';

type ProcessingState = 'idle' | 'processing' | 'confirming' | 'error';

interface ReceiptContextType {
    state: ProcessingState;
    parsedTransactions: ParsedTransaction[];
    images: ImageInput[];
    error: string | null;
    progress: { current: number; total: number; merchant: string };
    isReading: boolean;
    isMinimized: boolean;
    isOpen: boolean;
    addImage: (file: File) => Promise<void>;
    removeImage: (id: string) => void;
    processAllImages: () => Promise<void>;
    handleRetry: () => void;
    removeTransaction: (index: number) => void;
    updateTransaction: (index: number, data: ParsedTransaction) => void;
    setMinimized: (minimized: boolean) => void;
    setOpen: (open: boolean) => void;
    reset: () => void;
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

const compressImage = (blob: Blob, maxDimension: number = 1200): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            if (width > height) {
                if (width > maxDimension) {
                    height *= maxDimension / width;
                    width = maxDimension;
                }
            } else {
                if (height > maxDimension) {
                    width *= maxDimension / height;
                    height = maxDimension;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('Failed context');
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((result) => {
                if (result) resolve(result);
                else reject('Compression failed');
            }, 'image/jpeg', 0.8); 
        };
        img.onerror = reject;
    });
};

export const ReceiptProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<ProcessingState>('idle');
    const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [images, setImages] = useState<ImageInput[]>([]);
    const [progress, setProgress] = useState({ current: 0, total: 0, merchant: '' });
    const [activeReads, setActiveReads] = useState(0);
    const [isMinimized, setMinimized] = useState(false);
    const [isOpen, setOpen] = useState(false);
    
    const isReading = activeReads > 0;
    
    const { categories, findCategoryByName } = useCategories();
    const { t } = useLanguage();
    const { preferredCurrency } = useCurrency();
    const { addToast } = useNotification();
    const { business } = useAuth();

    const fileSignatures = useRef<Set<string>>(new Set());

    const addImage = useCallback(async (file: File) => {
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_FILE_SIZE) {
            addToast(t('notifications.fileTooLarge', { size: (file.size / 1024 / 1024).toFixed(1) }), "error");
            return;
        }

        const sig = `${file.size}-${file.name}-${file.lastModified}`;
        if (fileSignatures.current.has(sig)) {
            addToast(t('notifications.duplicateDocument'), "info");
            return;
        }

        setActiveReads(prev => prev + 1);
        try {
            const isPdf = file.type === 'application/pdf';
            let base64: string;
            let previewUrl: string;
            let mimeType = file.type;

            if (isPdf) {
                const reader = new FileReader();
                base64 = await new Promise((resolve, reject) => {
                    reader.onload = () => {
                        const result = reader.result as string;
                        resolve(result.split(',')[1]);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                previewUrl = 'https://cdn-icons-png.flaticon.com/512/337/337946.png';
            } else {
                const compressedBlob = await compressImage(file);
                base64 = await blobToBase64(compressedBlob);
                previewUrl = URL.createObjectURL(compressedBlob);
                mimeType = 'image/jpeg';
            }
            
            const newImage: ImageInput = {
                id: uuidv4(),
                base64,
                mimeType,
                previewUrl
            };

            fileSignatures.current.add(sig);
            setImages(prev => [...prev, newImage]);
            setState('idle');
        } catch (err) {
            console.error("Document handling error:", err);
            addToast(t('notifications.processDocumentError'), "error");
        } finally {
            setActiveReads(prev => Math.max(0, prev - 1));
        }
    }, [addToast]);

    const removeImage = useCallback((id: string) => {
        setImages(prev => {
            const target = prev.find(img => img.id === id);
            if (target) URL.revokeObjectURL(target.previewUrl);
            return prev.filter(img => id !== img.id);
        });
    }, []);

    const processImages = async (imgs: ImageInput[]): Promise<(ParsedTransaction & { receiptGroupId: string })[]> => {
        const transactionSchema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    transactionType: { 
                        type: Type.STRING,
                        description: "Must be 'income' or 'expense'. Documents showing earnings, payouts, or deposits (like Uber/Lyft driver statements) should be 'income'. Standard receipts for purchases are 'expense'."
                    },
                    amount: { type: Type.NUMBER },
                    currency: { type: Type.STRING },
                    date: { type: Type.STRING },
                    item: { type: Type.STRING },
                    quantity: { type: Type.STRING },
                    merchant: { type: Type.STRING },
                    category: { type: Type.STRING },
                    kilometers: { type: Type.NUMBER },
                    usageType: { 
                        type: Type.STRING, 
                        description: "The usage type of the vehicle expense. Must be 'business', 'personal', or 'none'. Default to 'none' unless clearly specified or implied." 
                    },
                    confidence: { type: Type.NUMBER },
                    imageIndices: { 
                        type: Type.ARRAY, 
                        items: { type: Type.INTEGER },
                        description: "The 0-based indices of the images used for this transaction"
                    }
                },
                required: ['transactionType', 'amount', 'currency', 'item', 'category', 'imageIndices'],
            }
        };

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const promptText = `EXTRACT FINANCIAL DATA FROM ONE OR MORE DOCUMENTS.
        Business Context: ${business?.name || 'this business'} ${business?.businessType ? `(Type: ${business.businessType})` : ''}.
        Current Date: ${todayStr} (Use this to resolve relative dates like 'Today', 'Yesterday', or to disambiguate dates).
        
        CRITICAL RULES:
        1. INCOME VS EXPENSE: 
           - If the business is a gig worker (e.g. Uber/Lyft Driver), payout summaries and earnings statements are 'income'.
           - If the business is a construction firm or general company, Uber/Lyft receipts are typically 'expense' (transport).
           - Use the business context provided above to make the best judgment.
        2. CATEGORIES: Use one of these: ${categories.map(c => c.name).join(', ')}.
        3. CURRENCY: Default to ${preferredCurrency} unless specified.
        4. Return ONLY a valid JSON array of objects.`;

        try {
            const parts: any[] = imgs.map(img => ({ 
                inlineData: { mimeType: img.mimeType, data: img.base64 } 
            }));
            parts.push({ text: promptText });

            const responseText = await aiService.generate({
                model: 'gemini-3-flash-preview',
                contents: { parts },
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: transactionSchema,
                },
                metric: 'receiptScans',
            });

            const results = JSON.parse(responseText || '[]') as (ParsedTransaction & { imageIndices: number[] })[];
            
            return results.map(r => {
                // Safety check for dates in the future
                let finalDate = r.date ? new Date(r.date) : new Date();
                if (isNaN(finalDate.getTime()) || finalDate > today) {
                    finalDate = new Date();
                }

                return { 
                    ...r, 
                    id: uuidv4(),
                    date: finalDate.toISOString(),
                    transactionType: (r.transactionType || 'expense').toLowerCase().trim() as any,
                    currency: (r.currency || preferredCurrency).toUpperCase().trim() as any,
                    receiptGroupId: (r.imageIndices || [])
                        .map(idx => imgs[idx]?.id ? `receipt-${imgs[idx].id}` : null)
                        .filter(Boolean)
                        .join(',')
                };
            });
        } catch (err) {
            // Re-throw so the caller can distinguish a genuine extraction FAILURE from a
            // successful scan that simply found no transactions. Returning [] here would
            // silently drop the user's receipt.
            console.error(`Gemini call failed:`, err);
            throw err;
        }
    };

    const processAllImages = useCallback(async () => {
        if (images.length === 0) return;

        setState('processing');
        setError(null);
        setProgress({ current: 0, total: images.length, merchant: 'Initializing AI Engine...' });

        try {
            const chunkSize = 3;
            const chunks: ImageInput[][] = [];
            for (let i = 0; i < images.length; i += chunkSize) {
                chunks.push(images.slice(i, i + chunkSize));
            }

            let allResults: (ParsedTransaction & { receiptGroupId: string })[] = [];
            let processedCount = 0;
            let failedCount = 0;

            for (const chunk of chunks) {
                try {
                    const results = await processImages(chunk);
                    allResults = [...allResults, ...results];
                    setProgress(prev => ({
                        current: processedCount + chunk.length,
                        total: images.length,
                        merchant: (results && results.length > 0) ? (results[0].merchant || 'Scanning...') : 'Scanning...'
                    }));
                } catch (chunkErr) {
                    // Don't lose the whole batch because one chunk failed; record it and continue.
                    failedCount += chunk.length;
                    console.error('Receipt chunk failed to process:', chunkErr);
                }
                processedCount += chunk.length;
            }

            if (failedCount > 0) {
                const msg = failedCount === images.length
                    ? t('receiptProcessor.allFailed') || 'Could not read any of the receipts. Please try again.'
                    : (t('receiptProcessor.someFailed') || `${failedCount} of ${images.length} receipts could not be read.`);
                setError(msg);
                addToast(msg, 'error');
                // If nothing succeeded, stop here in an error state rather than showing an empty confirm.
                if (allResults.length === 0) {
                    setState('error');
                    return;
                }
            }

            const otherCategory = findCategoryByName('Other');
            const processedList = allResults.map(parsed => {
                const foundCategory = findCategoryByName(parsed.category);
                if (!foundCategory) parsed.category = otherCategory?.name || 'Other';
                parsed.amount = Number(parsed.amount) || 0;
                parsed.transactionType = (parsed.transactionType || 'expense').toLowerCase().trim() as any;
                parsed.currency = (parsed.currency || preferredCurrency).toUpperCase().trim() as any;
                parsed.hashIdempotency = generateTransactionPayload(
                    parsed.transactionType === 'expense' ? -Math.abs(parsed.amount) : Math.abs(parsed.amount),
                    parsed.date || new Date(),
                    parsed.currency,
                    parsed.merchant || ''
                );
                return parsed;
            });

            const fuelTransactions: ParsedTransaction[] = [];
            const otherTransactions: ParsedTransaction[] = [];
            const standaloneOdos: ParsedTransaction[] = [];

            processedList.forEach((tx) => {
                const categoryLower = tx.category?.toLowerCase() || '';
                const itemLower = tx.item?.toLowerCase() || '';
                const isFuel = categoryLower === 'fuel' || itemLower.includes('gas') || itemLower.includes('fuel');
                const isOdo = itemLower.includes('odometer') || (tx.kilometers && Number(tx.amount) === 0);
                
                if (isOdo && Number(tx.amount) === 0) standaloneOdos.push(tx);
                else if (isFuel) fuelTransactions.push(tx);
                else otherTransactions.push(tx);
            });

            const sortedFuel = [...fuelTransactions].sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());
            const sortedOdos = [...standaloneOdos].sort((a, b) => (a.kilometers || 0) - (b.kilometers || 0));

            sortedFuel.forEach((fuelTx, i) => {
                if (i < sortedOdos.length) {
                    const odoTx = sortedOdos[i];
                    fuelTx.kilometers = odoTx.kilometers;
                    const fuelGid = fuelTx.receiptGroupId || '';
                    const odoGid = odoTx.receiptGroupId || '';
                    fuelTx.receiptGroupId = Array.from(new Set([...fuelGid.split(','), ...odoGid.split(',')])).filter(Boolean).join(',');
                }
            });

            setParsedTransactions([...fuelTransactions, ...otherTransactions]);
            setState('confirming');
            setMinimized(false);
            setOpen(true);
            addToast(t('notifications.analysisComplete'), "success");
        } catch (e) {
            console.error('Batch processing error:', e);
            setError("Analysis failed. Please check your internet connection.");
            setState('error');
            setMinimized(false);
            setOpen(true);
        }
    }, [categories, findCategoryByName, images, preferredCurrency, addToast]);

    const handleRetry = useCallback(() => {
        setState('idle');
        setError(null);
        setParsedTransactions([]);
        images.forEach(img => URL.revokeObjectURL(img.previewUrl));
        setImages([]);
        fileSignatures.current.clear();
    }, [images]);

    const removeTransaction = useCallback((index: number) => {
        setParsedTransactions(prev => prev.filter((_, i) => i !== index));
    }, []);

    const updateTransaction = useCallback((index: number, data: ParsedTransaction) => {
        setParsedTransactions(prev => {
            const newList = [...prev];
            newList[index] = data as any;
            return newList;
        });
    }, []);

    const reset = useCallback(() => {
        handleRetry();
        setOpen(false);
        setMinimized(false);
    }, [handleRetry]);

    return (
        <ReceiptContext.Provider value={{
            state, parsedTransactions, images, error, progress, isReading, isMinimized, isOpen,
            addImage, removeImage, processAllImages, handleRetry, removeTransaction, updateTransaction,
            setMinimized, setOpen, reset
        }}>
            {children}
        </ReceiptContext.Provider>
    );
};

export const useReceipt = () => {
    const context = useContext(ReceiptContext);
    if (context === undefined) {
        throw new Error('useReceipt must be used within a ReceiptProvider');
    }
    return context;
};
