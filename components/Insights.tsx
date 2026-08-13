
import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart as BarChartIcon, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, BarChart } from 'recharts';
import { Lightbulb, RefreshCw, Loader2, Check, ArrowRight, Zap, AlertCircle, Layers, Plus, Sparkles, Gauge, Trash2, ChevronDown } from 'lucide-react';
import { Transaction, Currency, AIProposal, DistanceUnit } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCategories } from '../contexts/CategoryContext';
import { useAIInsight } from '../hooks/useAIInsight';
import { useLocalInsights } from '../hooks/useLocalInsights';
import { useLanguage } from '../contexts/LanguageContext';
import { useInventory } from '../contexts/InventoryContext';
import { useAuth } from '../contexts/AuthContext';
import { convertDistance } from '../utils/helpers';
import UsageLimitModal from './UsageLimitModal';
import { HapticService } from '../services/hapticService';

const getCssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const HistoryItem: React.FC<{ proposal: AIProposal }> = ({ proposal }) => {
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
    const { t } = useLanguage();
    return (
        <div className="bg-[var(--bg-secondary)]/50 rounded-xl border border-[var(--border-primary-translucent)] overflow-hidden">
            <div 
                className="p-4 flex items-center gap-4 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            >
                <div className="w-10 h-10 rounded-full bg-[var(--positive)]/10 text-[var(--positive-text)] flex items-center justify-center shrink-0">
                    <Check size={18} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--text-primary)] leading-tight">{proposal.title}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)] mt-1 font-medium uppercase">
                        {t('insights.applied')} {proposal.appliedAt ? new Date(proposal.appliedAt).toLocaleDateString() : t('insights.recently')}
                    </p>
                </div>
                <div className="ml-auto shrink-0 flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-[var(--positive-text)] bg-[var(--positive)]/10 px-2.5 py-1 rounded-full border border-[var(--positive)]/20">
                        {proposal.impact.length > 15 ? t('insights.impactLabel') : proposal.impact}
                    </span>
                    <ChevronDown size={14} className={`text-[var(--text-tertiary)] transition-transform duration-300 ${isHistoryExpanded ? 'rotate-180' : ''}`} />
                </div>
            </div>
            <AnimatePresence>
                {isHistoryExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-[var(--bg-tertiary)]/20 border-t border-[var(--border-primary-translucent)]"
                    >
                        <div className="p-4">
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
                                {proposal.description}
                            </p>
                            <div className="bg-[var(--positive)]/5 p-3 rounded-lg border border-[var(--positive)]/10">
                                <p className="text-[10px] font-bold text-[var(--positive-text)] uppercase tracking-wider mb-1">{t('insights.impactAnalysis')}</p>
                                <p className="text-xs text-[var(--positive-text)] font-medium leading-relaxed">
                                    {proposal.impact}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Insights: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    const { preferredCurrency, convertAmount } = useCurrency();
    const { theme } = useTheme(); 
    const { categories } = useCategories();
    const { t } = useLanguage();
    const { inventory, products } = useInventory();
    const { checkLimit, incrementUsage, currentUser, business, isPersonalMode } = useAuth();
    const { proposals, appliedProposals, insightText, loading, error, regenerateInsight, applyProposal, dismissProposal, clearHistory } = useAIInsight(transactions, inventory, products);
    const localInsights = useLocalInsights(transactions, categories);
    const [activeTab, setActiveTab] = useState<'proposals' | 'history'>('proposals');
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const distanceUnit: DistanceUnit = (isPersonalMode ? currentUser?.distanceUnit : business?.settings?.distanceUnit) || 'km';

    const handleRegenerate = async () => {
        const { reached } = checkLimit('aiInsights');
        if (reached) {
            setShowLimitModal(true);
            return;
        }
        await regenerateInsight();
        incrementUsage('aiInsights');
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        HapticService.impactLight();
        await handleRegenerate();
        setIsRefreshing(false);
        HapticService.notificationSuccess();
    };
    
    const [themeColors, setThemeColors] = useState({
        accent: getCssVar('--accent-primary'),
        textSecondary: getCssVar('--text-secondary'),
        bgSecondary: getCssVar('--bg-secondary'),
        borderPrimary: getCssVar('--border-primary'),
        textPrimary: getCssVar('--text-primary'),
        categoryColors: {
            Materials: '#3b82f6', Fuel: '#f97316', Payroll: '#10b981',
            Maintenance: '#f59e0b', Transport: '#6366f1', Utilities: '#8b5cf6',
            Other: '#64748b', Income: '#22c55e',
        }
    });

    useEffect(() => {
        setThemeColors({
            accent: getCssVar('--accent-primary'),
            textSecondary: getCssVar('--text-secondary'),
            bgSecondary: getCssVar('--bg-secondary'),
            borderPrimary: getCssVar('--border-primary'),
            textPrimary: getCssVar('--text-primary'),
            categoryColors: { 
                Materials: '#3b82f6', Fuel: '#f97316', Payroll: '#10b981',
                Maintenance: '#f59e0b', Transport: '#6366f1', Utilities: '#8b5cf6',
                Other: '#64748b', Income: '#22c55e',
            }
        });
    }, [theme]);

    const { weeklySpending, topCategories, vehicleUsage } = useMemo(() => {
        const financialExpenses = transactions.filter(t => t.type === 'expense' && (!t.usageType || t.usageType === 'none'));
        
        const weeklyData = Array(7).fill(0).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return {
                name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                date: d,
                amount: 0
            };
        }).reverse();

        for (const expense of financialExpenses) {
            const dayIndex = weeklyData.findIndex(d => d.date.toDateString() === expense.date.toDateString());
            if (dayIndex !== -1) {
                weeklyData[dayIndex].amount += convertAmount(expense.amount, expense.currency, preferredCurrency);
            }
        }
        
        const categoryMap: { [key: string]: number } = {};
        let totalExpenses = 0;
        for (const expense of financialExpenses) {
            const convertedAmount = convertAmount(expense.amount, expense.currency, preferredCurrency);
            if (!categoryMap[expense.categoryId]) {
                categoryMap[expense.categoryId] = 0;
            }
            categoryMap[expense.categoryId] += convertedAmount;
            totalExpenses += convertedAmount;
        }

        const sortedCategories = Object.entries(categoryMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([id, amount]) => {
                const category = categories.find(c => c.id === id);
                return {
                    name: category?.name || t('common.unknown'),
                    amount,
                    percentage: totalExpenses > 0 ? ((amount / totalExpenses) * 100) : 0
                };
            });

        const vehicleUsage = transactions.reduce((acc, t) => {
            if (t.usageType && t.usageType !== 'none') {
                const convertedAmount = convertAmount(t.amount, t.currency, preferredCurrency);
                if (t.kilometers) {
                    // Always store raw KM in calculation, convert for display
                    acc[t.usageType].kilometers += t.kilometers;
                }
                acc[t.usageType].expenses += convertedAmount;
            }
            return acc;
        }, { business: { kilometers: 0, expenses: 0 }, personal: { kilometers: 0, expenses: 0 } } as Record<string, { kilometers: number, expenses: number }>);
            
        return { weeklySpending: weeklyData, topCategories: sortedCategories, vehicleUsage };
    }, [transactions, preferredCurrency, convertAmount, categories]);
    
    return (
        <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
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

                <div className="flex justify-between items-end mb-2">
                <div>
                    <p className="text-[10px] font-bold text-[var(--accent-primary-light)] uppercase tracking-[0.2em] mb-1">{t('insights.businessIntelligence')}</p>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{t('insights.title')}</h1>
                </div>
                <button 
                    onClick={handleRegenerate} 
                    disabled={loading}
                    className="p-3 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--accent-primary-light)] border border-[var(--border-primary-translucent)] transition-all disabled:opacity-50 shadow-sm"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>
            </motion.div>

            {/* AI Narrative Analysis Section */}
            <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-primary-translucent)] shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles size={64} className="text-[var(--accent-primary-light)]" />
                </div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-[var(--accent-primary)]/10 rounded-lg text-[var(--accent-primary-light)]">
                         <Lightbulb size={20} />
                    </div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-primary)]">{t('insights.strategicNarrative')}</h2>
                </div>
                
                {loading && !insightText ? (
                    <div className="flex items-center gap-3 py-4">
                        <Loader2 className="animate-spin text-[var(--accent-primary-light)]" size={20} />
                        <p className="text-[var(--text-secondary)] italic">{t('insights.analyzing')}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <motion.p 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            className="text-[var(--text-primary)] leading-relaxed text-lg"
                        >
                            {insightText}
                        </motion.p>
                        
                        {/* Local Insights / Alerts */}
                        {localInsights.length > 0 && (
                            <div className="pt-4 border-t border-[var(--border-primary-translucent)] flex flex-wrap gap-2">
                                {localInsights.map((alert, idx) => (
                                    <div key={`${alert.id}-${idx}`} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border ${
                                        alert.type === 'warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                        alert.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                    }`}>
                                        <AlertCircle size={12} />
                                        <span>{alert.title}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Actionable Proposals Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Zap size={18} className="text-[var(--accent-primary-light)]" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">{t('insights.smartProposals')}</h2>
                    </div>
                    <div className="flex bg-[var(--bg-tertiary)] p-1 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                        <button 
                            onClick={() => setActiveTab('proposals')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'proposals' ? 'bg-[var(--accent-primary)] text-[var(--text-contrast)] shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
                        >
                            {t('insights.active')} ({proposals.length})
                        </button>
                        <button 
                            onClick={() => setActiveTab('history')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'history' ? 'bg-[var(--accent-primary)] text-[var(--text-contrast)] shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
                        >
                            {t('insights.history')} ({appliedProposals.length})
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'proposals' ? (
                        <motion.div 
                            key="proposals-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {loading && proposals.length === 0 && (
                                <div className="flex flex-col items-center justify-center p-12 bg-[var(--bg-secondary)] rounded-2xl border border-dashed border-[var(--border-primary)] space-y-3">
                                    <Loader2 className="animate-spin text-[var(--accent-primary-light)]" size={32} />
                                    <span className="text-[var(--text-secondary)] text-sm font-medium">{t('insights.scanning')}</span>
                                </div>
                            )}
                            
                            {!loading && proposals.length === 0 && !error && (
                                <div className="p-10 text-center bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary-translucent)] shadow-inner">
                                    <Check className="mx-auto text-[var(--positive-text)] mb-3" size={40} />
                                    <p className="text-[var(--text-primary)] font-bold text-lg">{t('insights.booksClear')}</p>
                                    <p className="text-sm text-[var(--text-secondary)] mt-1">{t('insights.noProposals')}</p>
                                </div>
                            )}

                            {proposals.map((proposal) => (
                                <ProposalCard 
                                    key={proposal.id} 
                                    proposal={proposal} 
                                    onApply={() => applyProposal(proposal)} 
                                    onDismiss={() => dismissProposal(proposal)}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="history-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {appliedProposals.length === 0 ? (
                                <div className="p-12 text-center bg-[var(--bg-secondary)] rounded-2xl border border-dashed border-[var(--border-primary-translucent)]">
                                    <Sparkles className="mx-auto text-[var(--text-tertiary)] mb-3 opacity-20" size={40} />
                                    <p className="text-[var(--text-secondary)] font-medium">{t('insights.noHistory')}</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex justify-end mb-2">
                                        <button 
                                            onClick={clearHistory}
                                            className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--negative-text)] hover:opacity-80 transition-opacity uppercase tracking-wider"
                                        >
                                            <Trash2 size={12} />
                                            {t('insights.clearHistory')}
                                        </button>
                                    </div>
                                    {appliedProposals.map((proposal, idx) => (
                                        <HistoryItem key={`${proposal.id}-${idx}`} proposal={proposal} />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InsightCard title={t('insights.spendingThisWeek', { currency: preferredCurrency })}>
                     <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklySpending} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                            <XAxis dataKey="name" stroke={themeColors.textSecondary} fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke={themeColors.textSecondary} fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: 'var(--bg-tertiary)', opacity: 0.1 }}
                                contentStyle={{ background: themeColors.bgSecondary, border: `1px solid ${themeColors.borderPrimary}`, borderRadius: '0.75rem', fontSize: '12px' }}
                                labelStyle={{ color: themeColors.textPrimary, fontWeight: 'bold' }}
                                itemStyle={{ color: themeColors.accent }}
                                formatter={(value) => [`${new Intl.NumberFormat().format(Number(value))} ${preferredCurrency}`, t('common.total')]}
                            />
                            <Bar dataKey="amount" fill={themeColors.accent} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </InsightCard>

                <InsightCard title={t('insights.topCategories')}>
                    <div className="space-y-5 py-2">
                        {topCategories.map((cat, idx) => (
                            <div key={`${cat.name}-${idx}`} className="relative">
                               <div className="flex justify-between items-center mb-1.5 text-xs font-bold uppercase tracking-wider">
                                    <span className="text-[var(--text-primary)]">{cat.name}</span>
                                    <span className="text-[var(--text-secondary)]">{cat.percentage.toFixed(1)}%</span>
                               </div>
                               <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5 overflow-hidden shadow-inner">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: themeColors.categoryColors[cat.name as keyof typeof themeColors.categoryColors] || '#64748b' }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${cat.percentage}%` }}
                                        transition={{ duration: 1, delay: idx * 0.1, ease: "circOut" }}
                                    />
                               </div>
                            </div>
                        ))}
                    </div>
                </InsightCard>

                <InsightCard title={t('insights.vehicleEfficiency')} icon={Gauge}>
                    <div className="space-y-6 py-2">
                        <div className="bg-[var(--bg-tertiary)]/50 p-4 rounded-xl border border-[var(--border-primary-translucent)]">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{t('insights.totalDistanceTracked')}</span>
                                <span className="text-lg font-bold text-[var(--text-primary)]">
                                    {new Intl.NumberFormat().format(
                                        distanceUnit === 'km' 
                                        ? (vehicleUsage.business.kilometers + vehicleUsage.personal.kilometers)
                                        : convertDistance(vehicleUsage.business.kilometers + vehicleUsage.personal.kilometers, 'km', 'miles')
                                    )} {distanceUnit.toUpperCase()}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary-translucent)]">
                                    <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">{t('vehicle.businessUsage')}</p>
                                    <p className="text-xl font-bold text-[var(--text-primary)]">
                                        {new Intl.NumberFormat().format(
                                            distanceUnit === 'km' ? vehicleUsage.business.kilometers : convertDistance(vehicleUsage.business.kilometers, 'km', 'miles')
                                        )} <span className="text-[10px] opacity-50">{distanceUnit.toUpperCase()}</span>
                                    </p>
                                    <p className="text-[9px] text-emerald-400 font-bold mt-1 uppercase">
                                        Est. Savings: {new Intl.NumberFormat().format(vehicleUsage.business.kilometers * 0.67)} {preferredCurrency}
                                    </p>
                                </div>
                                <div className="p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary-translucent)]">
                                    <p className="text-[10px] font-bold text-purple-400 uppercase mb-1">{t('vehicle.personalUsage')}</p>
                                    <p className="text-xl font-bold text-[var(--text-primary)]">
                                        {new Intl.NumberFormat().format(
                                            distanceUnit === 'km' ? vehicleUsage.personal.kilometers : convertDistance(vehicleUsage.personal.kilometers, 'km', 'miles')
                                        )} <span className="text-[10px] opacity-50">{distanceUnit.toUpperCase()}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {['business', 'personal'].map((type, idx) => {
                            const data = vehicleUsage[type as keyof typeof vehicleUsage] as any;
                            const totalKm = vehicleUsage.business.kilometers + vehicleUsage.personal.kilometers;
                            const kmPercent = totalKm > 0 ? (data.kilometers / totalKm) * 100 : 0;
                            const color = type === 'business' ? 'text-blue-400' : 'text-purple-400';
                            const bgColor = type === 'business' ? 'bg-blue-500/20' : 'bg-purple-500/20';

                            return (
                                <div key={`${type}-${idx}`} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className={`text-[10px] font-bold uppercase tracking-widest ${color}`}>{t(`transactionForm.${type}`)}</p>
                                            <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                                                {new Intl.NumberFormat().format(data.expenses)} <span className="text-xs font-medium opacity-50 uppercase">{preferredCurrency}</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-[var(--text-primary)]">
                                                {new Intl.NumberFormat().format(
                                                    distanceUnit === 'km' ? data.kilometers : convertDistance(data.kilometers, 'km', 'miles')
                                                )} {distanceUnit.toUpperCase()}
                                            </p>
                                            <p className="text-[10px] text-[var(--text-tertiary)] font-medium uppercase">{kmPercent.toFixed(1)}% {t('insights.ofTotalDistance')}</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2 overflow-hidden shadow-inner">
                                        <motion.div
                                            className={`h-full rounded-full ${type === 'business' ? 'bg-blue-500' : 'bg-purple-500'}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${kmPercent}%` }}
                                            transition={{ duration: 1, ease: "circOut" }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </InsightCard>
            </div>

            {/* Add the modal at the end of the component */}
            <UsageLimitModal 
                isOpen={showLimitModal}
                onClose={() => setShowLimitModal(false)}
                metric="aiInsights"
                onAdComplete={() => {
                    regenerateInsight();
                    incrementUsage('aiInsights');
                }}
            />
        </div>
    );
};

const ProposalCard: React.FC<{ proposal: AIProposal, onApply: () => Promise<boolean>, onDismiss: () => void }> = ({ proposal, onApply, onDismiss }) => {
    const [state, setState] = useState<'idle' | 'applying' | 'success'>('idle');
    const { t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);
    
    const handleApply = async () => {
        setState('applying');
        const success = await onApply();
        if (success) {
            setState('success');
        } else {
            setState('idle');
        }
    };

    const typeIcons = {
        reclassify: <Layers size={18} />,
        create_category: <Plus size={18} />,
        budget_alert: <AlertCircle size={18} />,
        optimization: <Zap size={18} />
    };

    const typeColors = {
        reclassify: "bg-blue-500/10 text-blue-500",
        create_category: "bg-purple-500/10 text-purple-500",
        budget_alert: "bg-amber-500/10 text-amber-500",
        optimization: "bg-emerald-500/10 text-emerald-500"
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary-translucent)] shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col"
        >
            <AnimatePresence>
                {state === 'success' && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-[var(--positive)]/10 backdrop-blur-[2px] z-10 flex items-center justify-center gap-3"
                    >
                        <div className="bg-[var(--positive)] text-[var(--text-contrast)] p-2 rounded-full">
                            <Check size={20} />
                        </div>
                        <span className="font-bold text-[var(--positive-text)]">{t('insights.appliedSuccess')}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="p-5 pb-0 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${typeColors[proposal.type]}`}>
                        {typeIcons[proposal.type]}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-[var(--text-primary)] leading-tight text-lg truncate">{proposal.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold uppercase text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded">
                                {proposal.type.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={onDismiss}
                    className="p-2 text-[var(--text-tertiary)] hover:text-[var(--negative-text)] transition-colors bg-[var(--bg-tertiary)] rounded-lg"
                    title={t('common.dismiss')}
                >
                    <Plus size={16} className="rotate-45" />
                </button>
            </div>

            {/* Body */}
            <div className="p-5 pt-4 flex-1">
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {proposal.description}
                </p>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 bg-[var(--bg-tertiary)]/30 border-t border-[var(--border-primary-translucent)]">
                <div className="flex items-center justify-between gap-4">
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 group/impact"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] group-hover/impact:text-[var(--text-secondary)] transition-colors">{t('insights.impact')}</span>
                        <div className="flex items-center gap-1.5 bg-[var(--positive)]/10 px-2 py-0.5 rounded-full border border-[var(--positive)]/20">
                            <span className="text-[10px] font-bold uppercase text-[var(--positive-text)]">
                                {proposal.impact.length > 20 ? t('insights.viewDetails') : proposal.impact}
                            </span>
                            <ChevronDown size={12} className={`text-[var(--positive-text)] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                    </button>
                    <button 
                        onClick={handleApply}
                        disabled={state !== 'idle'}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-[var(--text-contrast)] font-bold text-sm hover:brightness-110 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        {state === 'applying' ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <>
                                {t('insights.apply')} <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 mt-4 border-t border-[var(--border-primary-translucent)]">
                                <p className="text-xs text-[var(--positive-text)] leading-relaxed font-medium bg-[var(--positive)]/5 p-3 rounded-xl border border-[var(--positive)]/10">
                                    {proposal.impact}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

const InsightCard: React.FC<{ title: string; children: React.ReactNode; icon?: React.ElementType, actionButton?: React.ReactNode }> = ({ title, children, icon: Icon, actionButton }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[var(--bg-secondary)] p-5 rounded-2xl border border-[var(--border-primary-translucent)] shadow-sm h-full"
    >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] flex items-center">
              {Icon && <Icon className="mr-2 text-[var(--warning-text)]" size={16} />}
              {title}
            </h2>
            {actionButton}
        </div>
        {children}
    </motion.div>
);

export default Insights;
