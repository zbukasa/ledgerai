
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, DollarSign, BarChart, Fuel, Users, HardHat, Camera, TrendingUp, Settings2, Navigation, Mic, HelpCircle, RefreshCw } from 'lucide-react';
import { Transaction, Currency, QuickAddAction } from '../types';
import TransactionItem from './TransactionItem';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCategories } from '../contexts/CategoryContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { AVAILABLE_QUICK_ACTIONS, DEFAULT_QUICK_ACTIONS } from '../constants';
import QuickAddCustomizer from './QuickAddCustomizer';
import * as LucideIcons from 'lucide-react';
import { HapticService } from '../services/hapticService';

interface DashboardProps {
    transactions: Transaction[];
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: string) => void;
    onArchive: (id: string) => void;
    onQuickAdd: (data: Partial<Transaction>) => void;
    onScan: () => void;
    onStartTrip?: () => void;
    onVoiceEntry?: () => void;
    onRecordProduction?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, onEdit, onDelete, onArchive, onQuickAdd, onScan, onStartTrip, onVoiceEntry, onRecordProduction }) => {
    const { preferredCurrency, convertAmount, getDecimalPlaces } = useCurrency();
    const { findCategoryByName } = useCategories();
    const { currentUser, isPersonalMode, business, setPersonalMode, hasFeature } = useAuth();
    const { t } = useLanguage();
    const { addToast } = useNotification();

    const contextName = isPersonalMode ? t('profile.personal') : (business?.name || t('profile.organization'));

    const [selectedActionIds, setSelectedActionIds] = React.useState<string[]>(() => {
        const saved = localStorage.getItem('quickAddActions');
        return saved ? JSON.parse(saved) : DEFAULT_QUICK_ACTIONS;
    });
    const [isCustomizerOpen, setIsCustomizerOpen] = React.useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [confirmingArchive, setConfirmingArchive] = React.useState<string | null>(null);

    const handleUpdateActions = (newIds: string[]) => {
        setSelectedActionIds(newIds);
        localStorage.setItem('quickAddActions', JSON.stringify(newIds));
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        HapticService.impactLight();
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsRefreshing(false);
        HapticService.notificationSuccess();
    };

    // Calculate All-Time Totals with robust number casting and case-insensitive matching
    const incomeTotal = useMemo(() => {
        if (!transactions) return 0;
        return transactions
            .filter(t => t.type?.toLowerCase() === 'income' && (!t.usageType || t.usageType === 'none'))
            .reduce((sum, t) => {
                const amount = Number(t.amount) || 0;
                const converted = convertAmount(amount, t.currency, preferredCurrency);
                return sum + (isNaN(converted) ? 0 : converted);
            }, 0);
    }, [transactions, preferredCurrency, convertAmount]);

    const expensesTotal = useMemo(() => {
        if (!transactions) return 0;
        return transactions
            .filter(t => t.type?.toLowerCase() === 'expense' && (!t.usageType || t.usageType === 'none'))
            .reduce((sum, t) => {
                const amount = Number(t.amount) || 0;
                const converted = convertAmount(amount, t.currency, preferredCurrency);
                return sum + (isNaN(converted) ? 0 : converted);
            }, 0);
    }, [transactions, preferredCurrency, convertAmount]);

    const balanceOverall = incomeTotal - expensesTotal;

    // Ensure transactions are sorted by date descending for the dashboard feed
    const recentTransactions = useMemo(() => 
        [...transactions]
            .filter(t => !t.usageType || t.usageType === 'none')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
    , [transactions]);
    
    const formatNumber = (num: number, currency: Currency) => {
        const value = isNaN(num) ? 0 : num;
        if (value === 0) return '0';
        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            maximumFractionDigits: getDecimalPlaces(currency),
            minimumFractionDigits: getDecimalPlaces(currency)
        }).format(value);
    };

    const handleQuickAddClick = (action: QuickAddAction) => {
        let prefillData: Partial<Transaction> | undefined;
        let category;

        switch(action.actionType) {
            case 'fuel':
                category = findCategoryByName('Fuel');
                if (category) prefillData = { type: 'expense', categoryId: category.id, item: 'fuel', currency: preferredCurrency };
                break;
            case 'payroll':
                category = findCategoryByName('Payroll');
                if (category) prefillData = { type: 'expense', categoryId: category.id, item: 'workerWage', currency: preferredCurrency };
                break;
            case 'materials':
                category = findCategoryByName('Materials');
                if (category) prefillData = { type: 'expense', categoryId: category.id, item: 'Cement', quantity: '1', currency: preferredCurrency };
                break;
            case 'income':
                category = findCategoryByName('Income');
                if (category) prefillData = { type: 'income', categoryId: category.id, item: t('quickAddItems.generalIncome'), currency: preferredCurrency };
                break;
            case 'production':
                if (!hasFeature('INVENTORY')) {
                    addToast(t('subscription.upgradeRequired'), 'info');
                    return;
                }
                onRecordProduction?.();
                return;
            case 'scan':
                onScan();
                return;
            case 'trip':
                if (!hasFeature('VEHICLE_TRACKING')) {
                    addToast(t('subscription.upgradeRequired'), 'info');
                    return;
                }
                onStartTrip?.();
                return;
            case 'voice':
                onVoiceEntry?.();
                return;
        }
        if (prefillData) {
            onQuickAdd(prefillData);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Pull to Refresh Indicator */}
            <motion.div 
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                onDragEnd={(_, info) => {
                    if (info.offset.y > 80 && !isRefreshing) {
                        handleRefresh();
                    }
                }}
                className="relative"
            >
                <AnimatePresence>
                    {isRefreshing && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 40, opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="flex justify-center items-center mb-2"
                        >
                            <RefreshCw size={20} className="animate-spin text-[var(--accent-primary)]" />
                        </motion.div>
                    )}
                </AnimatePresence>

                <header className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {t('dashboard.greeting', { name: currentUser?.name?.split(' ')[0] || '' })}
                    </h1>
                    <div className="relative group">
                        <button 
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            <div className={`w-2 h-2 rounded-full ${isPersonalMode ? 'bg-blue-400' : 'bg-emerald-400'}`}></div>
                            <span>{t('dashboard.activeProfile', { context: contextName })}</span>
                            <LucideIcons.ChevronDown size={12} className={`transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isProfileMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsProfileMenuOpen(false)}></div>
                                <div className="absolute top-full start-0 mt-2 w-48 bg-[var(--bg-secondary)] border border-[var(--border-primary-translucent)] rounded-xl shadow-xl z-20 overflow-hidden py-1">
                                    <button 
                                        onClick={() => { setPersonalMode(true); setIsProfileMenuOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors ${isPersonalMode ? 'bg-blue-500/10 text-blue-400' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-interactive-hover)]'}`}
                                    >
                                        <LucideIcons.User size={14} />
                                        <span>{t('profile.personal')}</span>
                                    </button>
                                    <button 
                                        onClick={() => { setPersonalMode(false); setIsProfileMenuOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors ${!isPersonalMode ? 'bg-emerald-500/10 text-emerald-400' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-interactive-hover)]'}`}
                                    >
                                        <LucideIcons.Building size={14} />
                                        <span>{business?.name || t('profile.organization')}</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <button 
                    onClick={onScan} 
                    className="p-3 rounded-full bg-[var(--bg-tertiary)] text-[var(--accent-primary-light)] hover:bg-[var(--bg-interactive-hover)] md:hidden"
                    aria-label={t('nav.scan')}
                >
                    <Camera size={24} />
                </button>
            </header>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-[var(--accent-primary-gradient-from)] to-[var(--accent-primary-gradient-to)] rounded-2xl p-6 text-[var(--text-contrast)] shadow-2xl"
                style={{ boxShadow: `0 20px 25px -5px var(--accent-primary-shadow)` }}
            >
                <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-[var(--text-contrast)]/75">{t('dashboard.totalBalance', { currency: preferredCurrency })}</span>
                    <DollarSign className="text-[var(--text-contrast)]/90" size={24} />
                </div>
                <p className="text-4xl md:text-5xl font-bold mt-2 tracking-tight" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatNumber(balanceOverall, preferredCurrency)}
                </p>
                <div className="border-t border-[var(--border-accent-translucent)] my-4"></div>
                <div className="flex items-center space-x-2 text-sm text-[var(--text-contrast)]/90">
                    <TrendingUp size={16} />
                    <span>{t('dashboard.netWorth')}</span>
                </div>
            </motion.div>

            {/* Trial CTA for Free Users - Moved and Refined */}
            {((isPersonalMode ? (currentUser?.tier || 'free') : (business?.tier || 'free')) === 'free') && !currentUser?.trialStartedAt && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => {
                        window.dispatchEvent(new CustomEvent('open-subscription-view'));
                    }}
                    className="bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border-primary-translucent)] shadow-sm cursor-pointer flex items-center justify-between group transition-all hover:bg-[var(--bg-tertiary)]"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                            <LucideIcons.Star size={18} fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[var(--text-primary)]">
                                {t('subscription.startTrial')}
                            </p>
                            <p className="text-[var(--text-secondary)] text-[10px]">Unlock Premium features for 7 days.</p>
                        </div>
                    </div>
                    <div className="text-[var(--accent-primary-light)] group-hover:translate-x-1 transition-transform">
                        <LucideIcons.ArrowRight size={16} />
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <StatCard 
                    title={t('dashboard.totalIncome')}
                    amount={incomeTotal} 
                    currency={preferredCurrency}
                    formatNumber={formatNumber}
                    icon={ArrowUpRight} 
                    color="text-[var(--positive-text)]" 
                    bgColor="bg-[var(--positive-bg-light)]" 
                />
                <StatCard 
                    title={t('dashboard.totalExpenses')}
                    amount={expensesTotal} 
                    currency={preferredCurrency}
                    formatNumber={formatNumber}
                    icon={ArrowDownRight} 
                    color="text-[var(--negative-text)]" 
                    bgColor="bg-[var(--negative-bg-light)]"
                />
            </div>
            
            <div>
                 <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t('dashboard.quickAdd')}</h2>
                    <button 
                        onClick={() => setIsCustomizerOpen(true)}
                        className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent-primary-light)] hover:text-[var(--accent-primary)] transition-colors"
                    >
                        <Settings2 size={14} />
                        <span>{t('common.customize')}</span>
                    </button>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {selectedActionIds.map(id => {
                        const action = AVAILABLE_QUICK_ACTIONS.find(a => a.id === id);
                        if (!action) return null;
                        // @ts-ignore
                        const Icon = LucideIcons[action.icon] || HelpCircle;
                        return (
                            <QuickAddItem 
                                key={action.id}
                                icon={Icon} 
                                label={t(action.labelKey)} 
                                onClick={() => handleQuickAddClick(action)}
                                isIncome={action.isIncome}
                                isLocked={
                                    (action.actionType === 'production' && !hasFeature('INVENTORY')) ||
                                    (action.actionType === 'trip' && !hasFeature('VEHICLE_TRACKING'))
                                }
                            />
                        );
                    })}
                 </div>
            </div>

            <QuickAddCustomizer 
                isOpen={isCustomizerOpen}
                onClose={() => setIsCustomizerOpen(false)}
                selectedIds={selectedActionIds}
                onUpdate={handleUpdateActions}
            />

            <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3 mt-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t('dashboard.recentTransactions')}</h2>
                <div className="space-y-3">
                    {recentTransactions.length > 0 ? recentTransactions.map((tx, index) => (
                         <TransactionItem 
                            key={tx.id} 
                            transaction={tx} 
                            index={index} 
                            onEdit={() => onEdit(tx)} 
                            onDelete={() => onDelete(tx.id)} 
                            onArchive={() => {
                                if (tx.isArchived) {
                                    onArchive(tx.id);
                                } else {
                                    setConfirmingArchive(tx.id);
                                }
                            }}
                        />
                    )) : (
                        <div className="text-center py-8 bg-[var(--bg-secondary-translucent)] rounded-lg">
                            <BarChart className="mx-auto text-[var(--text-tertiary)]" size={32} />
                            <p className="mt-2 text-[var(--text-secondary)]">{t('dashboard.noRecentTransactions')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Archive Confirmation Modal */}
            <AnimatePresence>
                {confirmingArchive && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[var(--bg-primary)] border border-[var(--border-primary-translucent)] rounded-3xl w-full max-w-sm p-6 shadow-2xl"
                        >
                            <h3 className="text-xl font-black text-[var(--text-white)] mb-2">
                                {t('notifications.confirmArchiveTitle')}
                            </h3>
                            <p className="text-[var(--text-secondary)] text-sm mb-6">
                                {t('notifications.confirmArchiveMessage')}
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setConfirmingArchive(null)}
                                    className="flex-1 py-3 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-xl font-bold text-sm"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button 
                                    onClick={() => {
                                        onArchive(confirmingArchive);
                                        setConfirmingArchive(null);
                                    }}
                                    className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20"
                                >
                                    {t('common.archive')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const QuickAddItem: React.FC<{icon: React.ElementType, label: string, onClick: () => void, isIncome?: boolean, isLocked?: boolean}> = ({icon: Icon, label, onClick, isIncome, isLocked}) => {
    return (
        <motion.button
            onClick={onClick}
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-xl text-center transition-colors duration-200 relative ${isIncome ? 'bg-[var(--positive-bg-light)] hover:bg-[var(--positive-bg-translucent)]' : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-interactive-hover)]'} ${isLocked ? 'opacity-60' : ''}`}
        >
            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${isIncome ? 'bg-[var(--positive-bg-translucent)] text-[var(--positive-text)]' : 'bg-[var(--bg-tertiary)] text-[var(--accent-primary-light)]'}`}>
                <Icon size={20} />
            </div>
            <span className="text-xs font-semibold text-[var(--text-primary)]">{label}</span>
            {isLocked && (
                <div className="absolute top-2 end-2 text-[var(--text-tertiary)]">
                    <LucideIcons.Lock size={12} />
                </div>
            )}
        </motion.button>
    );
};

interface StatCardProps {
    title: string;
    amount: number;
    currency: Currency;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    formatNumber: (num: number, currency: Currency) => string;
}
const StatCard: React.FC<StatCardProps> = ({ title, amount, currency, icon: Icon, color, bgColor, formatNumber }) => (
     <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`p-4 rounded-xl ${bgColor}`}
    >
        <div className={`flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider ${color}`}>
            <Icon size={14} />
            <span>{title}</span>
        </div>
        <p className="text-xl font-bold mt-2 text-[var(--text-primary)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {formatNumber(amount, currency)}
        </p>
    </motion.div>
);

export default Dashboard;
