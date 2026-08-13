import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Gauge, Car, Navigation, History, TrendingUp, AlertCircle, Lock, Calendar, CheckCircle2, Sparkles, Trash2, Filter, Search, ChevronRight, Settings2, Download } from 'lucide-react';
import { Transaction, UsageType, DistanceUnit } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTrip } from '../contexts/TripContext';
import { convertDistance } from '../utils/helpers';
import { HapticService } from '../services/hapticService';
import TripTracker from './TripTracker';
import TransactionItem from './TransactionItem';
import RecurringTripModal from './RecurringTripModal';

interface VehicleViewProps {
    transactions: Transaction[];
    allTransactions: Transaction[];
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: string) => void;
    onArchive: (id: string) => void;
    onBulkArchive: (ids: string[], archive: boolean) => void;
    onQuickAdd: (data: Partial<Transaction>) => void;
    activeBusinessId: string;
}

const VehicleView: React.FC<VehicleViewProps> = ({ transactions, allTransactions, onEdit, onDelete, onArchive, onBulkArchive, onQuickAdd, activeBusinessId }) => {
    const { preferredCurrency, convertAmount } = useCurrency();
    const { t } = useLanguage();
    const { hasFeature, currentUser, business, isPersonalMode } = useAuth();
    const { historicalTrips, deleteTrip } = useTrip();
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [isCleanupModalOpen, setIsCleanupModalOpen] = useState(false);
    const [successData, setSuccessData] = useState<{ count: number, totalKm: number } | null>(null);

    const distanceUnit: DistanceUnit = (isPersonalMode ? currentUser?.distanceUnit : business?.settings?.distanceUnit) || 'km';

    // Mock tax rate per km (e.g. $0.67)
    const TAX_RATE_PER_KM = 0.67;
    const TAX_RATE_PER_MILE = TAX_RATE_PER_KM / 0.621371;

    if (!hasFeature('VEHICLE_TRACKING')) {
        return (
            <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
                <header className="flex justify-between items-end mb-2">
                    <div>
                        <p className="text-[10px] font-bold text-[var(--accent-primary-light)] uppercase tracking-[0.2em] mb-1">{t('vehicle.fleetOperations')}</p>
                        <h1 className="text-3xl font-black text-[var(--text-white)] tracking-tight">
                            {t('vehicle.title')}
                        </h1>
                    </div>
                    <div className="p-3 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary-translucent)] text-[var(--accent-primary-light)] shadow-sm">
                        <Car size={24} />
                    </div>
                </header>

                <div className="bg-[var(--bg-secondary)] p-12 rounded-2xl border border-dashed border-[var(--border-primary)] text-center space-y-4">
                    <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center text-[var(--text-tertiary)] mx-auto">
                        <Lock size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{t('subscription.premiumFeature')}</h3>
                        <p className="text-sm text-[var(--text-tertiary)] max-w-xs mx-auto">{t('subscription.upgradeRequired')}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Vehicle transactions are non-trip expenses like fuel/maintenance
    const vehicleTransactions = transactions.filter(t => t.usageType && t.usageType !== 'none' && !t.item?.startsWith('Trip:'));
    
    const stats = useMemo(() => {
        const s = { businessKm: 0, businessExp: 0, personalKm: 0, personalExp: 0 };
        
        // Add from trips table
        historicalTrips.forEach(trip => {
            if (trip.usageType === 'business') s.businessKm += trip.distance || 0;
            else if (trip.usageType === 'personal') s.personalKm += trip.distance || 0;
        });

        // Add from transactions (for legacy data and non-trip expenses)
        vehicleTransactions.forEach(t => {
            const amount = convertAmount(t.amount, t.currency, preferredCurrency);
            if (t.usageType === 'business') {
                s.businessKm += t.kilometers || 0;
                s.businessExp += amount;
            } else if (t.usageType === 'personal') {
                s.personalKm += t.kilometers || 0;
                s.personalExp += amount;
            }
        });
        return s;
    }, [historicalTrips, vehicleTransactions, convertAmount, preferredCurrency]);

    const totalKm = stats.businessKm + stats.personalKm;
    const businessPercent = totalKm > 0 ? (stats.businessKm / totalKm) * 100 : 0;

    // Combine trips and transactions for the logs list
    const combinedLogs = useMemo(() => {
        const logs = [
            ...historicalTrips.map(trip => ({
                id: trip.id,
                date: new Date(trip.startTime),
                item: `Trip: ${trip.routeName || 'Manual Trip'}`,
                amount: 0,
                currency: preferredCurrency,
                type: 'trip' as const,
                kilometers: trip.distance,
                usageType: trip.usageType,
                isTrip: true
            })),
            ...vehicleTransactions.map(tx => ({
                ...tx,
                date: new Date(tx.date),
                isTrip: false
            }))
        ];
        return logs.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [historicalTrips, vehicleTransactions, preferredCurrency]);

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
            <header className="flex justify-between items-end mb-2">
                <div>
                    <p className="text-[10px] font-bold text-[var(--accent-primary-light)] uppercase tracking-[0.2em] mb-1">{t('vehicle.fleetOperations')}</p>
                    <h1 className="text-3xl font-black text-[var(--text-white)] tracking-tight">
                        {t('vehicle.title')}
                    </h1>
                </div>
                <div className="p-3 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary-translucent)] text-[var(--accent-primary-light)] shadow-sm">
                    <Car size={24} />
                </div>
            </header>

            {/* Active Tracker Section */}
            <section className="bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--accent-primary)]/20 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Navigation size={20} className="text-[var(--accent-primary-light)]" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-white)]">{t('vehicle.liveTripTracking')}</h2>
                    </div>
                    {hasFeature('RECURRING_TRIPS') && (
                        <button 
                            onClick={() => setIsRecurringModalOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-lg text-xs font-bold border border-[var(--accent-primary)]/20 hover:bg-[var(--accent-primary)] hover:text-[var(--text-contrast)] transition-all"
                        >
                            <Calendar size={14} />
                            {t('vehicle.logRecurring')}
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {successData && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute inset-0 z-10 bg-[var(--accent-primary)] flex flex-col items-center justify-center text-[var(--text-contrast)] p-6 text-center"
                        >
                            <Sparkles className="mb-2 animate-pulse" size={40} />
                            <h3 className="text-xl font-black mb-1">{t('vehicle.tripsLogged', { count: successData.count })}</h3>
                            <p className="text-sm opacity-90 max-w-xs">
                                {t('vehicle.taxSavingsMessage', { 
                                    amount: (distanceUnit === 'km' 
                                        ? successData.totalKm * TAX_RATE_PER_KM 
                                        : convertDistance(successData.totalKm, 'km', 'miles') * TAX_RATE_PER_MILE).toFixed(2),
                                    currency: preferredCurrency
                                })}
                            </p>
                            <button 
                                onClick={() => setSuccessData(null)}
                                className="mt-4 px-6 py-2 bg-white text-[var(--accent-primary)] rounded-xl font-bold text-sm"
                            >
                                {t('common.awesome')}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex justify-center">
                    <TripTracker />
                </div>
                <p className="text-xs text-[var(--text-tertiary)] text-center mt-4">
                    {t('vehicle.trackRealTime')}
                </p>
            </section>

            {/* Usage Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UsageCard 
                    type={t('vehicle.businessUsage')} 
                    km={stats.businessKm} 
                    expense={stats.businessExp} 
                    currency={preferredCurrency}
                    color="text-blue-400"
                    bgColor="bg-blue-500/10"
                    progressColor="bg-blue-500"
                    percent={totalKm > 0 ? (stats.businessKm / totalKm) * 100 : 0}
                    unit={distanceUnit}
                />
                <UsageCard 
                    type={t('vehicle.personalUsage')} 
                    km={stats.personalKm} 
                    expense={stats.personalExp} 
                    currency={preferredCurrency}
                    color="text-purple-400"
                    bgColor="bg-purple-500/10"
                    progressColor="bg-purple-500"
                    percent={totalKm > 0 ? (stats.personalKm / totalKm) * 100 : 0}
                    unit={distanceUnit}
                />
            </div>

            {/* Efficiency Insight */}
            {totalKm > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-4 rounded-xl border border-emerald-500/20 flex items-center gap-4"
                >
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[var(--text-white)]">{t('vehicle.businessUsageStats', { percent: businessPercent.toFixed(1) })}</p>
                        <p className="text-xs text-[var(--text-secondary)]">
                            {t('vehicle.loggedKm', { 
                                km: (distanceUnit === 'km' ? stats.businessKm : convertDistance(stats.businessKm, 'km', 'miles')).toFixed(1) 
                            }).replace('KM', distanceUnit.toUpperCase())}
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Recent Vehicle History */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <History size={18} className="text-[var(--text-secondary)]" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">{t('vehicle.recentLogs')}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsCleanupModalOpen(true)}
                            className="p-2 bg-[var(--bg-secondary)] text-[var(--text-tertiary)] rounded-lg border border-[var(--border-primary-translucent)] hover:text-[var(--accent-primary)] transition-colors"
                            title={t('vehicle.cleanupTitle')}
                        >
                            <Settings2 size={16} />
                        </button>
                    </div>
                </div>
                <div className="space-y-3">
                    {combinedLogs.length > 0 ? (
                        combinedLogs.slice(0, 5).map((log, index) => (
                            <TransactionItem 
                                key={log.id} 
                                transaction={log as any} 
                                index={index} 
                                onEdit={() => log.isTrip ? null : onEdit(log as any)} 
                                onDelete={() => log.isTrip ? deleteTrip(log.id) : onDelete(log.id)} 
                                onArchive={() => log.isTrip ? null : onArchive(log.id)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-10 bg-[var(--bg-secondary-translucent)] rounded-2xl border border-dashed border-[var(--border-primary)]">
                            <AlertCircle className="mx-auto text-[var(--text-tertiary)] mb-2" size={32} />
                            <p className="text-[var(--text-secondary)]">{t('vehicle.noLogs')}</p>
                        </div>
                    )}
                </div>
            </section>

            <RecurringTripModal 
                isOpen={isRecurringModalOpen} 
                onClose={() => setIsRecurringModalOpen(false)}
                onSuccess={(count, totalKm) => {
                    setSuccessData({ count, totalKm });
                    setTimeout(() => setSuccessData(null), 10000); // Auto close after 10s
                }}
                activeBusinessId={activeBusinessId}
            />

            <CleanupModal 
                isOpen={isCleanupModalOpen} 
                onClose={() => setIsCleanupModalOpen(false)}
                allTransactions={allTransactions}
                onDelete={onDelete}
                onArchive={onArchive}
                onBulkArchive={onBulkArchive}
                onEdit={onEdit}
            />
        </div>
    );
};

interface CleanupModalProps {
    isOpen: boolean;
    onClose: () => void;
    allTransactions: Transaction[];
    onDelete: (id: string) => void;
    onArchive: (id: string) => void;
    onBulkArchive: (ids: string[], archive: boolean) => void;
    onEdit: (transaction: Transaction) => void;
}

const CleanupModal: React.FC<CleanupModalProps> = ({ isOpen, onClose, allTransactions, onDelete, onArchive, onBulkArchive, onEdit }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [filterType, setFilterType] = useState<'all' | 'business' | 'personal'>('all');
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isConfirmingArchive, setIsConfirmingArchive] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const vehicleTrips = allTransactions.filter(tx => 
        (tx.usageType && tx.usageType !== 'none') || 
        (tx.item?.toLowerCase().includes('trip') || tx.item?.toLowerCase().includes('km'))
    );

    const filteredTrips = vehicleTrips.filter(tx => {
        const matchesSearch = tx.item?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             tx.merchant?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || tx.usageType === filterType;
        return matchesSearch && matchesType;
    });

    const { currentUser, business, isPersonalMode } = useAuth();
    const distanceUnit: DistanceUnit = (isPersonalMode ? currentUser?.distanceUnit : business?.settings?.distanceUnit) || 'km';

    const toggleSelect = (id: string) => {
        if (isProcessing) return;
        HapticService.impactLight();
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkDelete = async () => {
        if (!isConfirmingDelete) {
            HapticService.impactMedium();
            setIsConfirmingDelete(true);
            setIsConfirmingArchive(false);
            setTimeout(() => setIsConfirmingDelete(false), 4000);
            return;
        }

        setIsProcessing(true);
        HapticService.impactMedium();
        try {
            for (const id of selectedIds) {
                await onDelete(id);
            }
            setSelectedIds([]);
            setIsConfirmingDelete(false);
            HapticService.notificationSuccess();
        } catch (error) {
            console.error("Bulk delete failed", error);
            HapticService.notificationError();
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBulkArchive = async () => {
        if (!isConfirmingArchive) {
            HapticService.impactMedium();
            setIsConfirmingArchive(true);
            setIsConfirmingDelete(false);
            setTimeout(() => setIsConfirmingArchive(false), 4000);
            return;
        }

        setIsProcessing(true);
        HapticService.impactMedium();
        try {
            await onBulkArchive(selectedIds, true);
            setSelectedIds([]);
            setIsConfirmingArchive(false);
            HapticService.notificationSuccess();
        } catch (error) {
            console.error("Bulk archive failed", error);
            HapticService.notificationError();
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[var(--bg-primary)] border border-[var(--border-primary-translucent)] rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-[var(--border-primary-translucent)] flex justify-between items-center bg-[var(--bg-secondary)]">
                    <div>
                        <h2 className="text-xl font-black text-[var(--text-white)] tracking-tight flex items-center gap-2">
                            <Settings2 className="text-[var(--accent-primary)]" size={24} />
                            {t('vehicle.cleanupTitle')}
                        </h2>
                        <p className="text-xs text-[var(--text-tertiary)] mt-1">{t('vehicle.cleanupDesc')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--bg-tertiary)] rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 bg-[var(--bg-tertiary)] border-b border-[var(--border-primary-translucent)] space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={16} />
                        <input 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('vehicle.searchPlaceholder')}
                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary-translucent)] rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--accent-primary)]"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {(['all', 'business', 'personal'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap ${filterType === type ? 'bg-[var(--accent-primary)] text-[var(--text-contrast)] border-[var(--accent-primary)]' : 'bg-[var(--bg-primary)] border-[var(--border-primary-translucent)] text-[var(--text-tertiary)]'}`}
                            >
                                {t(`common.${type}`)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 relative">
                    {filteredTrips.map(tx => (
                        <div 
                            key={tx.id}
                            onClick={() => toggleSelect(tx.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${selectedIds.includes(tx.id) ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]' : 'bg-[var(--bg-secondary)] border-[var(--border-primary-translucent)] hover:border-[var(--text-tertiary)]'}`}
                        >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedIds.includes(tx.id) ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white' : 'border-[var(--border-primary)]'}`}>
                                {selectedIds.includes(tx.id) && <Check size={14} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-bold truncate">{tx.item}</p>
                                    <p className="text-xs font-black text-[var(--text-white)] ml-2">
                                        {(distanceUnit === 'km' ? (tx.kilometers || 0) : convertDistance(tx.kilometers || 0, 'km', 'miles')).toFixed(1)} {distanceUnit.toUpperCase()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-[var(--text-tertiary)]">{format(new Date(tx.date), 'MMM d, yyyy')}</span>
                                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${tx.usageType === 'business' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                        {tx.usageType}
                                    </span>
                                    {tx.businessId && <span className="text-[8px] text-emerald-400 font-bold uppercase">{t('common.orgContext')}</span>}
                                    {!tx.businessId && <span className="text-[8px] text-amber-400 font-bold uppercase">{t('common.personalContext')}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredTrips.length === 0 && (
                        <div className="text-center py-12 opacity-50">
                            <AlertCircle className="mx-auto mb-2" size={32} />
                            <p className="text-sm">{t('history.noTransactionsFound')}</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-[var(--border-primary-translucent)] bg-[var(--bg-secondary)] flex justify-between items-center">
                    <p className="text-xs text-[var(--text-tertiary)]">
                        {selectedIds.length} {t('common.selected')}
                    </p>
                    <div className="flex gap-2">
                        {selectedIds.length > 0 && (
                            <>
                                <button 
                                    onClick={handleBulkArchive}
                                    disabled={isProcessing}
                                    className={`px-3 py-2 transition-all rounded-xl text-[10px] font-bold flex items-center gap-2 shadow-lg ${isConfirmingArchive ? 'bg-amber-600 text-white' : 'bg-amber-500 text-white shadow-amber-500/20'}`}
                                >
                                    {isProcessing && isConfirmingArchive ? (
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Download size={12} className="rotate-180" />
                                            {isConfirmingArchive ? `${t('transactionItem.confirm')} (${selectedIds.length})` : t('common.archive')}
                                        </>
                                    )}
                                </button>
                                <button 
                                    onClick={handleBulkDelete}
                                    disabled={isProcessing}
                                    className={`px-3 py-2 transition-all rounded-xl text-[10px] font-bold flex items-center gap-2 shadow-lg ${isConfirmingDelete ? 'bg-red-600 text-white' : 'bg-red-500 text-white shadow-red-500/20'}`}
                                >
                                    {isProcessing && isConfirmingDelete ? (
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Trash2 size={12} />
                                            {isConfirmingDelete ? `${t('transactionItem.confirm')} (${selectedIds.length})` : t('common.delete')}
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                        <button 
                            onClick={onClose}
                            disabled={isProcessing}
                            className="px-3 py-2 bg-[var(--bg-tertiary)] text-[var(--text-white)] rounded-xl text-[10px] font-bold"
                        >
                            {t('common.dismiss')}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const X: React.FC<{ size?: number, className?: string }> = ({ size = 20, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const Check: React.FC<{ size?: number, className?: string }> = ({ size = 20, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 6 9 17l-5-5"/></svg>
);

interface UsageCardProps {
    type: string;
    km: number;
    expense: number;
    currency: string;
    color: string;
    bgColor: string;
    progressColor: string;
    percent: number;
    unit: DistanceUnit;
}

const UsageCard: React.FC<UsageCardProps> = ({ type, km, expense, currency, color, bgColor, progressColor, percent, unit }) => {
    const { t } = useLanguage();
    return (
        <div className={`p-5 rounded-2xl ${bgColor} border border-white/5`}>
            <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${color}`}>{type} {t('vehicle.usage')}</span>
                <Gauge size={16} className={color} />
            </div>
            <div className="flex justify-between items-end mb-4">
                <div>
                    <p className="text-2xl font-bold text-[var(--text-white)]">
                        {(unit === 'km' ? km : convertDistance(km, 'km', 'miles')).toFixed(1)} <span className="text-xs font-medium opacity-50">{unit.toUpperCase()}</span>
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{t('vehicle.totalDistance')}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-[var(--text-primary)]">{new Intl.NumberFormat().format(expense)} {currency}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{t('vehicle.totalCost')}</p>
                </div>
            </div>
            <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    className={`h-full ${progressColor}`}
                />
            </div>
        </div>
    );
};

export default VehicleView;
