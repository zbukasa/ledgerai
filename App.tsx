
import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, List, BarChart3, User, Mic, Camera, Car, MoreHorizontal, LayoutGrid, ChevronRight, Building2, Lock as LucideLock, Plus, FileText } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import Dashboard from './components/Dashboard';
import TransactionHistory from './components/TransactionHistory';
import Insights from './components/Insights';
import Profile from './components/Profile';
import VehicleView from './components/VehicleView';
import EditTransaction from './components/EditTransaction';
import VoiceEntry from './components/VoiceEntry';
import BiometricAuth from './components/BiometricAuth';
import QuickAddModal from './components/QuickAddModal';
import ReceiptProcessor from './components/ReceiptProcessor';
import ToastContainer from './components/ToastContainer';
import SyncStatus from './components/SyncStatus';
import LandingPage from './components/LandingPage';
import OnboardingWizard from './components/OnboardingWizard';
import BankConnectivity from './components/BankConnectivity';

import { Transaction, VoiceCommand, FilterState, Category, Trip } from './types';
import { CurrencyProvider, useCurrency } from './contexts/CurrencyContext';
import { useCategories } from './contexts/CategoryContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useNotification } from './contexts/NotificationContext';
import { getInitialTransactions } from './services/storageService'; 

import { syncService } from './services/syncService';
import { dataService } from './services/dataService';
import { realtimeService } from './services/realtimeService';

import { useLanguage } from './contexts/LanguageContext';
import { useLiveQuery } from 'dexie-react-hooks';
import TripTracker from './components/TripTracker';
import { TripProvider, useTrip } from './contexts/TripContext';

import { ReceiptProvider, useReceipt } from './contexts/ReceiptContext';
import { InventoryProvider, useInventory } from './contexts/InventoryContext';
import { ActivityProvider, useActivity } from './contexts/ActivityContext';
import { InventoryTab } from './components/InventoryTab';
import ReportsView from './components/ReportsView';
import MinimizedReceiptProgress from './components/MinimizedReceiptProgress';
import PendingProductModal from './components/PendingProductModal';
import UsageLimitModal from './components/UsageLimitModal';

import { AdController } from './components/ads/AdController';

import MobileApp from './components/MobileApp';
import { HapticService } from './services/hapticService';

const AppContainer: React.FC = () => (
    <AuthProvider>
        <CurrencyProvider>
            <TripProvider>
                <ActivityProvider>
                    <InventoryProvider>
                        <ReceiptProvider>
                            <AdController>
                                <MobileApp>
                                    <App />
                                </MobileApp>
                            </AdController>
                        </ReceiptProvider>
                    </InventoryProvider>
                </ActivityProvider>
            </TripProvider>
        </CurrencyProvider>
    </AuthProvider>
);

const App: React.FC = () => {
    const { currentUser, users, business, isPersonalMode, activeBusinessId, checkLimit, incrementUsage, hasFeature } = useAuth();
    const { addToast } = useNotification();
    const { t, language, setLanguage, isRTL } = useLanguage();
    const { findCategoryByName } = useCategories();
    const { preferredCurrency, convertAmount, getDecimalPlaces, setPreferredCurrency } = useCurrency();
    const { addBatch, sellItems, setInitialStock, loadData, adjustStockFromTransaction, pendingProduct, resolvePendingProduct } = useInventory();

    const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => {
        return localStorage.getItem('hasOnboarded') === 'true';
    });
    const [showLanding, setShowLanding] = useState<boolean>(true);

    // Live query for all transactions - this is the "Single Source of Truth"
    const allTransactions = useLiveQuery(() => syncService.getAllTransactions(), []) || [];
    const activeTransactionsRaw = useLiveQuery(() => syncService.getNonArchivedTransactions(), []) || [];
    
    // Filter transactions based on active context and user roles
    const contextTransactions = useMemo(() => {
        return allTransactions.filter(tx => {
            // Must match the active context (Personal vs Organization)
            const txBusinessId = tx.businessId || 'personal'; // Default legacy to personal if no ID
            if (txBusinessId !== activeBusinessId) return false;

            // In personal mode, we only show the user's own transactions
            if (isPersonalMode) {
                return tx.userId === currentUser?.id;
            }

            // In organization mode, apply role-based visibility
            const isAdmin = currentUser?.role === 'Admin';
            const restrictIncome = business?.settings?.restrictIncomeVisibility;

            // Admins see everything in the business
            if (isAdmin) return true;

            // Managers/Members:
            // 1. Always see their own transactions
            if (tx.userId === currentUser?.id) return true;

            // 2. See expenses (usually shared for coordination)
            if (tx.type === 'expense') return true;

            // 3. See income only if not restricted
            if (tx.type === 'income' && !restrictIncome) return true;

            return false;
        });
    }, [allTransactions, activeBusinessId, isPersonalMode, business, currentUser]);

    const activeTransactions = useMemo(() => {
        return activeTransactionsRaw.filter(tx => {
            const txBusinessId = tx.businessId || 'personal';
            if (txBusinessId !== activeBusinessId) return false;
            if (isPersonalMode) return tx.userId === currentUser?.id;
            
            const isAdmin = currentUser?.role === 'Admin';
            const restrictIncome = business?.settings?.restrictIncomeVisibility;
            if (isAdmin) return true;
            if (tx.userId === currentUser?.id) return true;
            if (tx.type === 'expense') return true;
            if (tx.type === 'income' && !restrictIncome) return true;
            return false;
        });
    }, [activeTransactionsRaw, activeBusinessId, isPersonalMode, business, currentUser]);

    const [activeView, setActiveView] = useState<'dashboard' | 'history' | 'insights' | 'profile' | 'vehicle' | 'bank' | 'inventory' | 'reports'>('dashboard');
    const [profileInitialView, setProfileInitialView] = useState<'main' | 'subscription'>('main');
    
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isVoiceEntryOpen, setIsVoiceEntryOpen] = useState(false);
    const [showProductionModal, setShowProductionModal] = useState(false);
    const { isOpen: isReceiptProcessorOpen, setOpen: setIsReceiptProcessorOpen } = useReceipt();
    const [quickAddData, setQuickAddData] = useState<Partial<Transaction> | null>(null);
    const [programmaticFilters, setProgrammaticFilters] = useState<FilterState | null>(null);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const { activeTrip, startTrip, stopTrip } = useTrip();

    const [limitModalOpen, setLimitModalOpen] = useState(false);
    const [limitMetric, setLimitMetric] = useState<'voiceCommands' | 'aiInsights' | 'receiptScans'>('voiceCommands');

    useEffect(() => {
        const handleOpenSubscription = () => {
            setProfileInitialView('subscription');
            setActiveView('profile');
        };
        window.addEventListener('open-subscription-view', handleOpenSubscription);
        return () => window.removeEventListener('open-subscription-view', handleOpenSubscription);
    }, []);

    useEffect(() => {
        if (business?.id) {
            dataService.setBusinessId(business.id);
            
            const handleSync = (event: any) => {
                const data = event.detail;
                if (data.type === 'transactions') {
                    // Force re-fetch from server or just rely on background sync
                    // For now, we'll just let the background sync handle it or add a manual sync
                    dataService.syncNow();
                }
            };
            
            window.addEventListener('realtime-sync', handleSync);
            return () => {
                window.removeEventListener('realtime-sync', handleSync);
            };
        } else {
            dataService.setBusinessId(null);
        }
    }, [business]);

    useEffect(() => {
        if (!currentUser || !hasOnboarded) return;
        const initDB = async () => {
            try {
                const existing = await syncService.getAllTransactions();
                if (existing.length === 0) {
                    const userIds = users.map(u => u.id);
                    const initial = getInitialTransactions(userIds);
                    for (const tx of initial) {
                        await dataService.createTransaction(tx);
                    }
                }
            } catch (error) {
                console.error("Failed to initialize database:", error);
                addToast(t('notifications.initError') || "Failed to initialize data", "error");
            }
        };
        initDB();
    }, [currentUser, users, hasOnboarded]);

    const handleOnboardingComplete = () => {
        localStorage.setItem('hasOnboarded', 'true');
        setHasOnboarded(true);
    };

    const addTransaction = async (newTransactionData: Omit<Transaction, 'id' | 'userId'>) => {
        if (!currentUser) return;
        try {
            const newTransaction: Transaction = {
                ...newTransactionData,
                date: newTransactionData.date || new Date(),
                id: uuidv4(),
                userId: currentUser.id,
                businessId: activeBusinessId || undefined,
            };
            
            // This call updates IndexedDB immediately, which triggers useLiveQuery
            await dataService.createTransaction(newTransaction);
            await adjustStockFromTransaction(newTransaction);
            HapticService.notificationSuccess();
            addToast(t('notifications.transactionSaved'), "success");
        } catch (error) {
            console.error(error);
            addToast(t('notifications.transactionSaveError'), "error");
            throw error instanceof Error ? error : new Error(typeof error === 'object' ? JSON.stringify(error) : String(error));
        }
    };

    const updateTransaction = async (updatedTransaction: Transaction) => {
        try {
            const oldTransaction = allTransactions.find(t => t.id === updatedTransaction.id);
            if (oldTransaction) {
                // Reverse old stock impact
                await adjustStockFromTransaction(oldTransaction, true);
            }
            await dataService.updateTransaction(updatedTransaction);
            // Apply new stock impact
            await adjustStockFromTransaction(updatedTransaction);
            addToast(t('notifications.transactionUpdated'), "success");
        } catch (error) {
            console.error(error);
            addToast(t('notifications.transactionUpdateError'), "error");
        }
    };

    const deleteTransaction = async (id: string) => {
        try {
            const transaction = allTransactions.find(t => t.id === id);
            if (transaction) {
                await adjustStockFromTransaction(transaction, true);
            }
            await dataService.deleteTransaction(id);
            HapticService.notificationWarning();
            addToast(t('notifications.transactionDeleted'), "success");
        } catch (error) {
            console.error(error);
            addToast(t('notifications.transactionDeleteError'), "error");
        }
    };

    const toggleArchiveTransaction = async (id: string) => {
        try {
            const transaction = allTransactions.find(t => t.id === id);
            if (transaction) {
                const updated = { ...transaction, isArchived: !transaction.isArchived };
                await dataService.updateTransaction(updated);
                addToast(updated.isArchived ? t('notifications.transactionArchived') : t('notifications.transactionUnarchived'), "success");
                HapticService.impactLight();
            }
        } catch (error) {
            console.error(error);
            addToast(t('notifications.transactionArchiveError'), "error");
        }
    };

    const bulkArchiveTransactions = async (ids: string[], archive: boolean = true) => {
        try {
            const transactionsToUpdate = allTransactions
                .filter(t => ids.includes(t.id))
                .map(t => ({ ...t, isArchived: archive }));
            
            if (transactionsToUpdate.length === 0) return;
            
            await dataService.bulkUpdateTransactions(transactionsToUpdate);
            
            addToast(archive ? t('notifications.bulkArchived') : t('notifications.bulkUnarchived'), "success");
            HapticService.notificationSuccess();
        } catch (error) {
            console.error(error);
            addToast(t('notifications.transactionArchiveError'), "error");
        }
    };
    
    const handleSaveTransaction = (transaction: Transaction) => {
        updateTransaction(transaction);
        setEditingTransaction(null);
    };

    const handleQuickAddSave = async (transactionData: Omit<Transaction, 'id' | 'userId'>) => {
        try {
            await addTransaction(transactionData);
            setQuickAddData(null);
        } catch (error) {
            console.error("Quick add save failed:", error);
        }
    };

    const handleVoiceCommand = async (command: VoiceCommand) => {
        incrementUsage('voiceCommands');
        switch (command.type) {
            case 'create':
                try {
                    await addTransaction(command.data);
                } catch (error) {
                    console.error("Voice command transaction failed:", error);
                }
                setIsVoiceEntryOpen(false);
                break;
            case 'edit':
                if (command.data.target === 'last' && activeTransactions.length > 0) {
                    const lastTransaction = activeTransactions[0];
                    setEditingTransaction(lastTransaction);
                } else {
                    addToast(t('history.noTransactionsFound'), 'info');
                }
                setIsVoiceEntryOpen(false);
                break;
            case 'trip':
                if (command.data.action === 'start') {
                    startTrip('business');
                } else {
                    const finishedTrip = stopTrip();
                    if (finishedTrip && finishedTrip.distance > 0) {
                        const fuelCategory = findCategoryByName('Fuel');
                        setQuickAddData({
                            type: 'expense',
                            categoryId: fuelCategory?.id,
                            item: 'Vehicle Trip',
                            amount: 0,
                            currency: preferredCurrency,
                            kilometers: Math.round(finishedTrip.distance),
                            usageType: finishedTrip.usageType || 'business'
                        });
                    }
                }
                setIsVoiceEntryOpen(false);
                break;
            case 'filter': {
                const { transactionType, categoryName, dateRange, calculateTotal } = command.data;
                const newFilters: FilterState = {};
                if(transactionType) newFilters.type = transactionType;
                
                let category: Category | undefined;
                if(categoryName) {
                    category = findCategoryByName(categoryName);
                    if(category) newFilters.categoryId = category.id;
                }

                if(dateRange) {
                    const { startDate, endDate } = getDateRange(dateRange);
                    newFilters.startDate = startDate;
                    newFilters.endDate = endDate;
                }
                
                if (calculateTotal) {
                    const filtered = activeTransactions.filter(tx => {
                        if (newFilters.type && newFilters.type !== 'all' && tx.type !== newFilters.type) return false;
                        if (newFilters.categoryId && tx.categoryId !== newFilters.categoryId) return false;
                        
                        const txDate = new Date(tx.date);
                        txDate.setHours(0,0,0,0);
                        
                        const start = newFilters.startDate ? new Date(newFilters.startDate) : null;
                        if(start) start.setHours(0,0,0,0);
                        
                        const end = newFilters.endDate ? new Date(newFilters.endDate) : null;
                        if(end) end.setHours(23,59,59,999);

                        if (start && txDate < start) return false;
                        if (end && txDate > end) return false;
                        
                        return true;
                    });
                    
                    const total = filtered.reduce((sum, tx) => sum + convertAmount(tx.amount, tx.currency, preferredCurrency), 0);
                    
                    const localeMap: { [key: string]: string } = { 
                        'en': 'en-US', 
                        'fr': 'fr-FR', 
                        'ln': 'ln-CD', 
                        'sw': 'sw-CD', 
                        'es': 'es-ES', 
                        'pt': 'pt-PT',
                        'hi': 'hi-IN',
                        'ar': 'ar-SA'
                    };
                    const locale = localeMap[language] || 'en-US';
                    const formatNumber = (num: number) => {
                        return new Intl.NumberFormat(locale, {
                            style: 'decimal',
                            maximumFractionDigits: getDecimalPlaces(preferredCurrency),
                            minimumFractionDigits: getDecimalPlaces(preferredCurrency),
                        }).format(num);
                    };

                    const descriptionParts = [];
                    if (transactionType === 'income') {
                        descriptionParts.push(t('notifications.filterIncome'));
                    } else {
                         descriptionParts.push(t('notifications.filterExpenses'));
                    }
                    if (category) descriptionParts.push(t('notifications.filterForCategory', { category: category.name }));
                    if (dateRange) descriptionParts.push(t(`notifications.filterDateRange.${dateRange}`));
                    
                    const filterDescription = descriptionParts.join(' ');
                    
                    addToast(t('notifications.filterTotal', {
                        description: filterDescription,
                        amount: formatNumber(total),
                        currency: preferredCurrency
                    }), 'info');
                }

                setProgrammaticFilters(newFilters);
                setActiveView('history');
                setIsVoiceEntryOpen(false);
                break;
            }
            case 'currency':
                setPreferredCurrency(command.data.currency);
                addToast(`Currency changed to ${command.data.currency}`, 'success');
                setIsVoiceEntryOpen(false);
                break;
            case 'language':
                setLanguage(command.data.language);
                addToast(`Language changed`, 'success');
                setIsVoiceEntryOpen(false);
                break;
            case 'production':
                addBatch({
                    batchId: `VOICE-${new Date().getTime().toString().slice(-4)}`,
                    date: new Date(),
                    productType: command.data.productType,
                    quantityProduced: command.data.quantity,
                    cementBagsUsed: command.data.cementBags,
                    curingStartDate: new Date()
                });
                setActiveView('inventory');
                setIsVoiceEntryOpen(false);
                break;
            case 'sale': {
                const { productType, quantity, price, currency } = command.data;
                try {
                    await sellItems(productType, quantity);
                    if (price) {
                        const salesCategory = findCategoryByName('Sales');
                        await addTransaction({
                            type: 'income',
                            amount: price * quantity,
                            currency: currency || preferredCurrency,
                            item: `${quantity} x ${productType}`,
                            categoryId: salesCategory?.id || 'cat-income',
                            date: new Date()
                        });
                    }
                } catch (error) {
                    console.error("Voice command sale failed:", error);
                }
                setActiveView('inventory');
                setIsVoiceEntryOpen(false);
                break;
            }
            case 'usage':
                sellItems(command.data.productType, command.data.quantity);
                setActiveView('inventory');
                setIsVoiceEntryOpen(false);
                break;
            case 'stock_adjust':
                setInitialStock(command.data.productType, command.data.quantity);
                setActiveView('inventory');
                setIsVoiceEntryOpen(false);
                break;
        }
    };

    const getDateRange = (range: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month'): { startDate: Date, endDate: Date } => {
        const start = new Date();
        const end = new Date();
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        switch(range) {
            case 'today': break;
            case 'yesterday':
                start.setDate(start.getDate() - 1);
                end.setDate(end.getDate() - 1);
                break;
            case 'this_week': {
                // Monday-based week. Compute end from start via day arithmetic so a week
                // that crosses a month boundary doesn't land in the wrong month.
                const dayOfWeek = start.getDay(); // 0=Sun..6=Sat
                const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                start.setDate(start.getDate() + mondayOffset);
                end.setTime(start.getTime());
                end.setDate(end.getDate() + 6);
                end.setHours(23, 59, 59, 999);
                break;
            }
            case 'last_week': {
                const dayOfWeek = start.getDay();
                const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                start.setDate(start.getDate() + mondayOffset - 7); // Monday of previous week
                end.setTime(start.getTime());
                end.setDate(end.getDate() + 6);
                end.setHours(23, 59, 59, 999);
                break;
            }
            case 'this_month':
                start.setDate(1);
                break;
            case 'last_month':
                start.setMonth(start.getMonth() - 1);
                start.setDate(1);
                end.setDate(0);
                break;
        }
        return { startDate: start, endDate: end };
    };

    if (!hasOnboarded && showLanding) {
        return <LandingPage onGetStarted={() => setShowLanding(false)} />;
    }

    if (!hasOnboarded && !showLanding) {
        return (
            <>
                <ToastContainer />
                <OnboardingWizard onComplete={handleOnboardingComplete} />
            </>
        );
    }

    if (!currentUser) {
        return (
            <>
                <ToastContainer />
                <BiometricAuth />
            </>
        );
    }

    type View = 'dashboard' | 'history' | 'insights' | 'profile' | 'vehicle' | 'bank' | 'inventory' | 'reports';

    const handleOpenVoice = () => {
        const { reached } = checkLimit('voiceCommands');
        if (reached) {
            setLimitMetric('voiceCommands');
            setLimitModalOpen(true);
        } else {
            setIsVoiceEntryOpen(true);
        }
    };

    const handleOpenReceipt = () => {
        const { reached } = checkLimit('receiptScans');
        if (reached) {
            setLimitMetric('receiptScans');
            setLimitModalOpen(true);
        } else {
            setIsReceiptProcessorOpen(true);
        }
    };

    const handleManualAdd = () => {
        setEditingTransaction({
            id: uuidv4(),
            userId: currentUser?.id || 'anonymous',
            date: new Date(),
            merchant: '',
            amount: 0,
            currency: preferredCurrency,
            type: 'expense',
            categoryId: findCategoryByName('Other')?.id || 'other',
            item: ''
        } as Transaction);
    };

    const views: { [key in View]: React.ReactNode } = {
        dashboard: (
            <Dashboard 
                transactions={activeTransactions} 
                onEdit={setEditingTransaction} 
                onDelete={deleteTransaction} 
                onArchive={toggleArchiveTransaction}
                onQuickAdd={setQuickAddData} 
                onScan={handleOpenReceipt} 
                onStartTrip={() => startTrip('business')}
                onVoiceEntry={handleOpenVoice}
                onRecordProduction={() => {
                    setActiveView('inventory');
                    setShowProductionModal(true);
                }}
            />
        ),
        history: <TransactionHistory 
            transactions={contextTransactions} 
            onEdit={setEditingTransaction} 
            onDelete={deleteTransaction} 
            onArchive={toggleArchiveTransaction} 
            onBulkArchive={bulkArchiveTransactions}
            initialFilters={programmaticFilters} 
            onClearInitialFilters={() => setProgrammaticFilters(null)} 
        />,
        insights: <Insights transactions={activeTransactions} />,
        vehicle: <VehicleView 
            transactions={activeTransactions} 
            allTransactions={allTransactions}
            onEdit={setEditingTransaction} 
            onDelete={deleteTransaction} 
            onArchive={toggleArchiveTransaction}
            onBulkArchive={bulkArchiveTransactions}
            onQuickAdd={setQuickAddData}
            activeBusinessId={activeBusinessId || 'personal'}
        />,
        inventory: <InventoryTab
            addTransaction={addTransaction} 
            initialShowAddModal={showProductionModal}
            onModalClose={() => setShowProductionModal(false)}
        />,
        bank: <BankConnectivity />,
        reports: <ReportsView />,
        profile: <Profile initialView={profileInitialView} />,
    };

    return (
        <>
            <ToastContainer />
            <SyncStatus />
            <MinimizedReceiptProgress />
            <div dir={isRTL ? 'rtl' : 'ltr'} className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen flex flex-col md:flex-row">
                <main className="flex-1 pb-24 md:pb-0 overflow-y-auto">
                    {/* Floating Trip Tracker Widget - Only shown when active */}
                    {activeTrip?.isActive && (
                        <div className="fixed top-4 start-1/2 -translate-x-1/2 z-50 pointer-events-none">
                            <div className="pointer-events-auto">
                                <TripTracker onTripEnd={(trip) => {
                                    if (trip.distance > 0) {
                                        const fuelCategory = findCategoryByName('Fuel');
                                        setQuickAddData({
                                            type: 'expense',
                                            categoryId: fuelCategory?.id,
                                            item: 'Vehicle Trip',
                                            amount: 0,
                                            currency: preferredCurrency,
                                            kilometers: Math.round(trip.distance),
                                            usageType: trip.usageType || 'business'
                                        });
                                    }
                                }} />
                            </div>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeView}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {views[activeView]}
                        </motion.div>
                    </AnimatePresence>
                </main>

                <AnimatePresence>
                    {editingTransaction && (
                        <EditTransaction
                            key="edit-transaction-modal"
                            transaction={editingTransaction}
                            onClose={() => setEditingTransaction(null)}
                            onSave={handleSaveTransaction}
                        />
                    )}
                    {isVoiceEntryOpen && (
                        <VoiceEntry
                            key="voice-entry-modal"
                            onClose={() => setIsVoiceEntryOpen(false)}
                            onCommand={handleVoiceCommand}
                            onManualEntry={handleManualAdd}
                        />
                    )}
                    {isReceiptProcessorOpen && (
                        <ReceiptProcessor
                            key="receipt-processor-modal"
                            onClose={() => setIsReceiptProcessorOpen(false)}
                            onSave={addTransaction}
                        />
                    )}
                    <UsageLimitModal 
                        key="usage-limit-modal"
                        isOpen={limitModalOpen}
                        onClose={() => setLimitModalOpen(false)}
                        metric={limitMetric}
                        onAdComplete={() => {
                            // Ad completed, allow one more use
                            if (limitMetric === 'voiceCommands') setIsVoiceEntryOpen(true);
                            if (limitMetric === 'receiptScans') setIsReceiptProcessorOpen(true);
                            if (limitMetric === 'aiInsights') setActiveView('insights');
                        }}
                        onUpgrade={() => {
                            setLimitModalOpen(false);
                            setProfileInitialView('subscription');
                            setActiveView('profile');
                        }}
                    />
                     {quickAddData && (
                        <QuickAddModal
                            initialData={quickAddData}
                            onClose={() => setQuickAddData(null)}
                            onSave={handleQuickAddSave}
                        />
                    )}
                    {pendingProduct && (
                        <PendingProductModal 
                            name={pendingProduct.name} 
                            onResolve={resolvePendingProduct} 
                        />
                    )}
                </AnimatePresence>

                <nav className="fixed bottom-0 start-0 end-0 h-20 bg-[var(--bg-secondary-translucent)] backdrop-blur-lg border-t border-[var(--border-primary-translucent)] flex justify-around items-center md:relative md:flex-col md:w-20 md:h-screen md:border-t-0 md:border-e z-40">
                    <NavItem icon={LayoutDashboard} label={t('nav.dashboard')} isActive={activeView === 'dashboard'} onClick={() => { setActiveView('dashboard'); setIsMoreMenuOpen(false); }} />
                    <NavItem icon={List} label={t('nav.history')} isActive={activeView === 'history'} onClick={() => { setActiveView('history'); setIsMoreMenuOpen(false); }} />
                    
                    <div className="relative flex items-center justify-center -mt-8 md:bottom-20 md:order-none md:mb-4">
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-[var(--bg-primary)] md:hidden"></div>
                        </div>
                        <button onClick={() => { handleOpenVoice(); setIsMoreMenuOpen(false); }} className="relative z-10 w-16 h-16 bg-gradient-to-br from-[var(--accent-primary-gradient-from)] to-[var(--accent-primary-gradient-to)] rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95" style={{ boxShadow: `0 8px 20px var(--accent-primary-shadow)` }}>
                            <Mic size={28} />
                        </button>
                    </div>

                    <div className="relative">
                        <NavItem 
                            icon={LayoutGrid} 
                            label={t('nav.more')} 
                            isActive={activeView === 'vehicle' || activeView === 'insights' || activeView === 'bank' || activeView === 'inventory' || isMoreMenuOpen} 
                            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} 
                        />
                        <AnimatePresence>
                            {isMoreMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                    className="absolute bottom-24 end-0 md:bottom-auto md:start-24 md:top-0 bg-[var(--bg-secondary)] border border-[var(--border-primary-translucent)] rounded-2xl shadow-2xl p-3 min-w-[240px] z-50"
                                >
                                    <div className="px-2 pb-2 mb-2 border-b border-[var(--border-primary-translucent)]">
                                        <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">{t('nav.operations')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <button 
                                            onClick={() => { setActiveView('vehicle'); setIsMoreMenuOpen(false); }}
                                            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeView === 'vehicle' ? 'bg-[var(--accent-primary)] text-[var(--text-contrast)]' : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${activeView === 'vehicle' ? 'bg-white/20' : 'bg-[var(--bg-tertiary)]'}`}>
                                                <Car size={20} />
                                            </div>
                                            <div className="text-start flex-grow">
                                                <p className="font-bold text-sm">{t('nav.vehicleTracking')}</p>
                                                <p className={`text-[10px] ${activeView === 'vehicle' ? 'text-[var(--text-contrast)]/70' : 'text-[var(--text-tertiary)]'}`}>{t('nav.vehicleTrackingDesc')}</p>
                                            </div>
                                            <ChevronRight size={14} className="opacity-30" />
                                        </button>

                                        <button 
                                            onClick={() => { 
                                                if (!hasFeature('INVENTORY')) {
                                                    setProfileInitialView('subscription');
                                                    setActiveView('profile');
                                                    addToast(t('subscription.upgradeRequired'), 'info');
                                                } else {
                                                    setActiveView('inventory'); 
                                                }
                                                setIsMoreMenuOpen(false); 
                                            }}
                                            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeView === 'inventory' ? 'bg-[var(--accent-primary)] text-[var(--text-contrast)]' : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'} ${!hasFeature('INVENTORY') ? 'opacity-60' : ''}`}
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${activeView === 'inventory' ? 'bg-white/20' : 'bg-[var(--bg-tertiary)]'}`}>
                                                <LayoutGrid size={20} />
                                                {!hasFeature('INVENTORY') && <LucideLock size={10} className="absolute bottom-2 end-2 text-[var(--accent-primary)]" />}
                                            </div>
                                            <div className="text-start flex-grow">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-sm">{t('nav.inventory')}</p>
                                                    {!hasFeature('INVENTORY') && <LucideLock size={12} className="text-[var(--text-tertiary)]" />}
                                                </div>
                                                <p className={`text-[10px] ${activeView === 'inventory' ? 'text-[var(--text-contrast)]/70' : 'text-[var(--text-tertiary)]'}`}>{t('nav.inventoryDesc')}</p>
                                            </div>
                                            <ChevronRight size={14} className="opacity-30" />
                                        </button>

                                        <button 
                                            onClick={() => { 
                                                if (!hasFeature('ADVANCED_EXPORT')) {
                                                    setProfileInitialView('subscription');
                                                    setActiveView('profile');
                                                    addToast(t('subscription.upgradeRequired'), 'info');
                                                } else {
                                                    setActiveView('reports'); 
                                                }
                                                setIsMoreMenuOpen(false); 
                                            }}
                                            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeView === 'reports' ? 'bg-[var(--accent-primary)] text-[var(--text-contrast)]' : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'} ${!hasFeature('ADVANCED_EXPORT') ? 'opacity-60' : ''}`}
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${activeView === 'reports' ? 'bg-white/20' : 'bg-[var(--bg-tertiary)]'}`}>
                                                <FileText size={20} />
                                                {!hasFeature('ADVANCED_EXPORT') && <LucideLock size={10} className="absolute bottom-2 end-2 text-[var(--accent-primary)]" />}
                                            </div>
                                            <div className="text-start flex-grow">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-sm">{t('nav.reports')}</p>
                                                    {!hasFeature('ADVANCED_EXPORT') && <LucideLock size={12} className="text-[var(--text-tertiary)]" />}
                                                </div>
                                                <p className={`text-[10px] ${activeView === 'reports' ? 'text-[var(--text-contrast)]/70' : 'text-[var(--text-tertiary)]'}`}>{t('nav.reportsDesc')}</p>
                                            </div>
                                            <ChevronRight size={14} className="opacity-30" />
                                        </button>
                                        
                                        <button 
                                            onClick={() => { 
                                                if (!hasFeature('AI_INSIGHTS')) {
                                                    setProfileInitialView('subscription');
                                                    setActiveView('profile');
                                                    addToast(t('subscription.upgradeRequired'), 'info');
                                                    setIsMoreMenuOpen(false);
                                                    return;
                                                }
                                                const { reached } = checkLimit('aiInsights');
                                                if (reached) {
                                                    setLimitMetric('aiInsights');
                                                    setLimitModalOpen(true);
                                                } else {
                                                    setActiveView('insights'); 
                                                }
                                                setIsMoreMenuOpen(false); 
                                            }}
                                            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeView === 'insights' ? 'bg-[var(--accent-primary)] text-[var(--text-contrast)]' : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'} ${!hasFeature('AI_INSIGHTS') ? 'opacity-60' : ''}`}
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${activeView === 'insights' ? 'bg-white/20' : 'bg-[var(--bg-tertiary)]'}`}>
                                                <BarChart3 size={20} />
                                                {!hasFeature('AI_INSIGHTS') && <LucideLock size={10} className="absolute bottom-2 end-2 text-[var(--accent-primary)]" />}
                                            </div>
                                            <div className="text-start flex-grow">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-sm">{t('nav.aiInsights')}</p>
                                                    {!hasFeature('AI_INSIGHTS') && <LucideLock size={12} className="text-[var(--text-tertiary)]" />}
                                                </div>
                                                <p className={`text-[10px] ${activeView === 'insights' ? 'text-[var(--text-contrast)]/70' : 'text-[var(--text-tertiary)]'}`}>{t('nav.aiInsightsDesc')}</p>
                                            </div>
                                            <ChevronRight size={14} className="opacity-30" />
                                        </button>

                                        <button 
                                            onClick={() => { 
                                                if (!hasFeature('BANK_SYNC')) {
                                                    setProfileInitialView('subscription');
                                                    setActiveView('profile');
                                                    addToast(t('subscription.upgradeRequired'), 'info');
                                                } else {
                                                    setActiveView('bank'); 
                                                }
                                                setIsMoreMenuOpen(false); 
                                            }}
                                            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeView === 'bank' ? 'bg-[var(--accent-primary)] text-[var(--text-contrast)]' : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'} ${!hasFeature('BANK_SYNC') ? 'opacity-60' : ''}`}
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${activeView === 'bank' ? 'bg-white/20' : 'bg-[var(--bg-tertiary)]'}`}>
                                                <Building2 size={20} />
                                                {!hasFeature('BANK_SYNC') && <LucideLock size={10} className="absolute bottom-2 end-2 text-[var(--accent-primary)]" />}
                                            </div>
                                            <div className="text-start flex-grow">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-sm">{t('nav.bankConnectivity')}</p>
                                                    {!hasFeature('BANK_SYNC') && <LucideLock size={12} className="text-[var(--text-tertiary)]" />}
                                                </div>
                                                <p className={`text-[10px] ${activeView === 'bank' ? 'text-[var(--text-contrast)]/70' : 'text-[var(--text-tertiary)]'}`}>{t('nav.bankConnectivityDesc')}</p>
                                            </div>
                                            <ChevronRight size={14} className="opacity-30" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <NavItem icon={User} label={t('nav.profile')} isActive={activeView === 'profile'} onClick={() => { setProfileInitialView('main'); setActiveView('profile'); setIsMoreMenuOpen(false); }} />
                </nav>
            </div>
        </>
    );
};

const NavItem: React.FC<{ icon: React.ElementType; label: string; isActive: boolean; onClick: () => void }> = ({ icon: Icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-16 h-16 transition-colors ${isActive ? 'text-[var(--accent-primary-light)]' : 'text-[var(--text-secondary)] hover:text-[var(--accent-primary-light)]'}`}>
        <Icon size={24} />
        <span className="text-xs mt-1">{label}</span>
    </button>
);

export default AppContainer;
