import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Filter, Share as ShareIcon, RefreshCw } from 'lucide-react';
import { Transaction, TransactionType, FilterState } from '../types';
import TransactionItem from './TransactionItem';
import { useCategories } from '../contexts/CategoryContext';
import { getCategoryAndSubCategoryNames } from '../utils/helpers';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { ExportUpgradeModal } from './ExportUpgradeModal';
import { HapticService } from '../services/hapticService';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

import JSZip from 'jszip';

interface TransactionHistoryProps {
    transactions: Transaction[];
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: string) => void;
    onArchive: (id: string) => void;
    onBulkArchive: (ids: string[], archive: boolean) => void;
    initialFilters?: FilterState | null;
    onClearInitialFilters?: () => void;
}

type FilterType = 'all' | TransactionType;

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, onEdit, onDelete, onArchive, onBulkArchive, initialFilters, onClearInitialFilters }) => {
    const [typeFilter, setTypeFilter] = useState<FilterType>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [showArchived, setShowArchived] = useState(false);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [confirmingArchive, setConfirmingArchive] = useState<string | 'bulk' | null>(null);
    const { categories, subCategories } = useCategories();
    const { t, language } = useLanguage();
    const { users, currentUser, business, isPersonalMode, upgradeTier } = useAuth();
    const { addToast } = useNotification();
    const tier = isPersonalMode ? (currentUser?.tier || 'free') : (business?.tier || 'free');

    useEffect(() => {
        if (initialFilters) {
            setTypeFilter(initialFilters.type || 'all');
            setCategoryFilter(initialFilters.categoryId || 'all');
            setStartDate(initialFilters.startDate || null);
            setEndDate(initialFilters.endDate || null);
            setShowArchived(initialFilters.showArchived || false);
            setIsFilterVisible(true);
            // Once applied, clear the programmatic filters so manual changes can take over
            if(onClearInitialFilters) onClearInitialFilters();
        }
    }, [initialFilters, onClearInitialFilters]);


    const formatDate = (date: Date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return t('common.today');
        if (date.toDateString() === yesterday.toDateString()) return t('common.yesterday');
        
        const localeMap: { [key: string]: string } = {
            'en': 'en-US',
            'fr': 'fr-FR',
            'ln': 'ln-CD',
            'sw': 'sw-CD',
            'es': 'es-ES',
            'pt': 'pt-PT',
            'hi': 'hi-IN',
            'ar': 'ar-SA',
        };
        const locale = localeMap[language] || 'en-US';
        return date.toLocaleDateString(locale, { weekday: 'long', month: 'short', day: 'numeric' });
    };


    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(tx => {
                // Archive filter: Hide archived unless showArchived is true
                if (!showArchived && tx.isArchived) return false;

                // Exclude vehicle trips from general history
                if (tx.usageType && tx.usageType !== 'none') return false;

                if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
                if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) return false;
                
                const txDate = new Date(tx.date);
                txDate.setHours(0,0,0,0);
                
                const start = startDate ? new Date(startDate) : null;
                if(start) start.setHours(0,0,0,0);
                
                const end = endDate ? new Date(endDate) : null;
                if(end) end.setHours(23,59,59,999);


                if (start && txDate < start) return false;
                if (end && txDate > end) return false;
                
                return true;
            })
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [transactions, typeFilter, categoryFilter, startDate, endDate]);

    const groupedTransactions = useMemo(() => {
        return filteredTransactions.reduce((acc, tx) => {
            const dateStr = formatDate(tx.date);
            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            acc[dateStr].push(tx);
            return acc;
        }, {} as Record<string, Transaction[]>);
    }, [filteredTransactions, formatDate]);

    const handleExport = async () => {
        HapticService.impactMedium();
        if (transactions.length === 0) {
            addToast(t('notifications.noTransactionsToExport'), "error");
            return;
        }

        setIsExporting(true);
        try {
            const dateStr = new Date().toISOString().split('T')[0];
            const filename = tier === 'free' ? `ledgerai_basic_export_${dateStr}.csv` : `ledgerai_accountant_export_${dateStr}.zip`;

            if (tier === 'free') {
                // Basic CSV for Free Users
                const headers = ['Date', 'Type', 'Description', 'Amount', 'Currency', 'Category'];
                const csvRows = [headers.join(',')];

                const formatCsvField = (field: any): string => {
                    if (field === null || field === undefined) return '';
                    const str = String(field);
                    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                        return `"${str.replace(/"/g, '""')}"`;
                    }
                    return str;
                };

                transactions.forEach(tx => {
                    const { categoryName } = getCategoryAndSubCategoryNames(tx.categoryId, tx.subCategoryId, categories, subCategories);
                    const row = [
                        tx.date.toISOString().split('T')[0],
                        tx.type.toUpperCase(),
                        formatCsvField(tx.item),
                        tx.amount,
                        tx.currency,
                        formatCsvField(categoryName)
                    ];
                    csvRows.push(row.join(','));
                });

                const csvString = csvRows.join('\n');
                const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
                
                if (Capacitor.isNativePlatform()) {
                    // Use Share API for mobile
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = async () => {
                        const base64data = reader.result as string;
                        await Share.share({
                            title: 'LedgerAI Export',
                            text: 'Here is your transaction export from LedgerAI.',
                            url: base64data,
                            dialogTitle: 'Share Export',
                        });
                    };
                } else {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', filename);
                    link.click();
                    URL.revokeObjectURL(url);
                }
                
                HapticService.notificationSuccess();
                setTimeout(() => setShowUpgradeModal(true), 1000);
            } else {
                // Accountant-Ready ZIP for Premium/Enterprise
                const zip = new JSZip();
                const receiptsFolder = zip.folder("receipts");
                
                const headers = [
                    'Date', 
                    'Reference ID', 
                    'Type', 
                    'Description', 
                    'Merchant', 
                    'Category', 
                    'Sub-Category', 
                    'Debit (Expense)', 
                    'Credit (Income)', 
                    'Currency', 
                    'Usage', 
                    'Recorded By', 
                    'Source', 
                    'Receipts'
                ];
                const csvRows = [headers.join(',')];

                const formatCsvField = (field: any): string => {
                    if (field === null || field === undefined) return '';
                    const str = String(field);
                    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                        return `"${str.replace(/"/g, '""')}"`;
                    }
                    return str;
                };

                transactions.forEach(tx => {
                    const { categoryName, subCategoryName } = getCategoryAndSubCategoryNames(tx.categoryId, tx.subCategoryId, categories, subCategories);
                    const recordedBy = users.find(u => u.id === tx.userId)?.name || 'Unknown';
                    
                    const receiptFilenames: string[] = [];
                    if (tx.receiptImages && tx.receiptImages.length > 0) {
                        tx.receiptImages.forEach((base64, idx) => {
                            const filename = `receipt_${tx.id}_${idx}.jpg`;
                            receiptFilenames.push(filename);
                            const base64Data = base64.split(',')[1] || base64;
                            receiptsFolder?.file(filename, base64Data, { base64: true });
                        });
                    }

                    const debit = tx.type === 'expense' ? tx.amount : '';
                    const credit = tx.type === 'income' ? tx.amount : '';

                    const row = [
                        tx.date.toISOString().split('T')[0],
                        tx.id,
                        tx.type.toUpperCase(),
                        formatCsvField(tx.item),
                        formatCsvField(tx.merchant || ''),
                        formatCsvField(categoryName),
                        formatCsvField(subCategoryName),
                        debit,
                        credit,
                        tx.currency,
                        formatCsvField(tx.usageType || 'none'),
                        formatCsvField(recordedBy),
                        formatCsvField(tx.source || 'manual'),
                        formatCsvField(receiptFilenames.join('; '))
                    ];
                    csvRows.push(row.join(','));
                });

                const csvString = csvRows.join('\n');
                zip.file("general_ledger.csv", csvString);

                const content = await zip.generateAsync({ type: "blob" });
                
                if (Capacitor.isNativePlatform()) {
                    const reader = new FileReader();
                    reader.readAsDataURL(content);
                    reader.onloadend = async () => {
                        const base64data = reader.result as string;
                        await Share.share({
                            title: 'LedgerAI Accountant Export',
                            text: 'Here is your accountant-ready export from LedgerAI.',
                            url: base64data,
                            dialogTitle: 'Share Export',
                        });
                    };
                } else {
                    const url = URL.createObjectURL(content);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', filename);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }
                HapticService.notificationSuccess();
            }
        } catch (error) {
            console.error("Export failed:", error);
            HapticService.notificationError();
            addToast(t('notifications.exportFailed'), "error");
        } finally {
            setIsExporting(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        HapticService.impactLight();
        // Simulate refresh or trigger sync
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsRefreshing(false);
        HapticService.notificationSuccess();
    };

    const handleDateChange = (setter: (date: Date | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.valueAsDate);
    };
    
    const clearDateFilters = () => {
        setStartDate(null);
        setEndDate(null);
    };
    
    const filtersAreActive = typeFilter !== 'all' || categoryFilter !== 'all' || startDate || endDate || showArchived;
    const dateInputClasses = "w-full bg-[var(--bg-tertiary)] rounded-lg p-2 text-[var(--text-primary)] border border-[var(--border-primary)] focus:border-[var(--accent-primary)] focus:outline-none";
    const selectClasses = "w-full bg-[var(--bg-tertiary)] rounded-lg p-2 text-[var(--text-primary)] border border-[var(--border-primary)] focus:border-[var(--accent-primary)] focus:outline-none";

    return (
        <div className="p-4 md:p-6">
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

                <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-white)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t('history.title')}</h1>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setIsFilterVisible(!isFilterVisible)} className="relative flex items-center space-x-2 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-interactive-hover)] transition-colors text-sm font-semibold">
                        <Filter size={16} />
                        <span>{t('history.filters')}</span>
                        {filtersAreActive && (
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[var(--accent-primary)] rounded-full border-2 border-[var(--bg-tertiary)]"></div>
                        )}
                    </button>
                    <button 
                        onClick={handleExport} 
                        disabled={isExporting}
                        className="relative flex items-center space-x-2 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-interactive-hover)] transition-colors text-sm font-semibold disabled:opacity-50"
                    >
                        {isExporting ? (
                            <div className="w-4 h-4 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Download size={16} />
                        )}
                        <span>{isExporting ? t('history.exporting') : t('history.export')}</span>
                        {tier === 'free' && (
                            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-600 text-[8px] font-black text-white rounded-full shadow-lg uppercase tracking-tighter">
                                Pro
                            </span>
                        )}
                    </button>
                </div>
                </div>
            </motion.div>
            
            <AnimatePresence>
                {isFilterVisible && (
                    <motion.div
                        key="filter-panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="bg-[var(--bg-secondary)] p-4 rounded-xl mb-6 space-y-4">
                             <h3 className="text-md font-semibold text-[var(--text-primary)]">{t('history.filterPanelTitle')}</h3>
                             <div>
                                <label htmlFor="category-filter" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('transactionForm.category')}</label>
                                <select id="category-filter" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className={selectClasses}>
                                    <option value="all">{t('common.all')}</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="start-date" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('history.startDate')}</label>
                                    <input type="date" id="start-date" value={startDate ? startDate.toISOString().split('T')[0] : ''} onChange={handleDateChange(setStartDate)} className={dateInputClasses} />
                                </div>
                                <div>
                                    <label htmlFor="end-date" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('history.endDate')}</label>
                                    <input type="date" id="end-date" value={endDate ? endDate.toISOString().split('T')[0] : ''} onChange={handleDateChange(setEndDate)} min={startDate ? startDate.toISOString().split('T')[0] : undefined} className={dateInputClasses} />
                                </div>
                             </div>
                             <div className="flex items-center justify-between p-2 bg-[var(--bg-tertiary)] rounded-lg">
                                <span className="text-sm font-medium text-[var(--text-primary)]">{t('history.showArchived')}</span>
                                <button 
                                    onClick={() => setShowArchived(!showArchived)}
                                    className={`w-10 h-5 rounded-full transition-colors relative ${showArchived ? 'bg-[var(--accent-primary)]' : 'bg-gray-600'}`}
                                >
                                    <motion.div 
                                        animate={{ x: showArchived ? 20 : 2 }}
                                        className="absolute top-1 w-3 h-3 bg-white rounded-full"
                                    />
                                </button>
                             </div>
                             
                             {filtersAreActive && filteredTransactions.length > 0 && !showArchived && (
                                <button 
                                    onClick={() => {
                                        HapticService.impactMedium();
                                        setConfirmingArchive('bulk');
                                    }}
                                    className="w-full py-2.5 bg-[var(--bg-tertiary)] text-amber-500 border border-amber-500/30 rounded-xl text-xs font-bold hover:bg-amber-500/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <Download size={14} className="rotate-180" />
                                    {t('common.archive')} ({filteredTransactions.length})
                                </button>
                             )}

                            <div className="flex space-x-2 pt-4 border-t border-[var(--border-primary-translucent)]">
                                <FilterChip label={t('common.all')} active={typeFilter === 'all'} onClick={() => setTypeFilter('all')} />
                                <FilterChip label={t('common.income')} active={typeFilter === 'income'} onClick={() => setTypeFilter('income')} />
                                <FilterChip label={t('common.expenses')} active={typeFilter === 'expense'} onClick={() => setTypeFilter('expense')} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-6">
                <AnimatePresence>
                    {Object.entries(groupedTransactions).map(([date, txs]) => (
                        <motion.div
                            key={date}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">{date}</h2>
                            <div className="space-y-3">
                                {(txs as Transaction[]).map((tx, index) => (
                                    <TransactionItem 
                                        key={tx.id} 
                                        transaction={tx} 
                                        index={index} 
                                        onEdit={() => onEdit(tx)} 
                                        onDelete={() => onDelete(tx.id)} 
                                        onArchive={() => {
                                            if (tx.isArchived) {
                                                onArchive(tx.id); // Unarchive doesn't need confirmation
                                            } else {
                                                setConfirmingArchive(tx.id);
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                 {filteredTransactions.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-10"
                    >
                        <p className="text-[var(--text-secondary)]">{t('history.noTransactionsFound')}</p>
                    </motion.div>
                )}
            </div>
            <ExportUpgradeModal 
                isOpen={showUpgradeModal} 
                onClose={() => setShowUpgradeModal(false)}
                onUpgrade={() => {
                    setShowUpgradeModal(false);
                    upgradeTier('premium');
                }}
            />

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
                                {confirmingArchive === 'bulk' 
                                    ? t('notifications.confirmBulkArchiveTitle', { count: filteredTransactions.length })
                                    : t('notifications.confirmArchiveTitle')}
                            </h3>
                            <p className="text-[var(--text-secondary)] text-sm mb-6">
                                {confirmingArchive === 'bulk'
                                    ? t('notifications.confirmBulkArchiveMessage')
                                    : t('notifications.confirmArchiveMessage')}
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
                                        if (confirmingArchive === 'bulk') {
                                            onBulkArchive(filteredTransactions.map(t => t.id), true);
                                        } else {
                                            onArchive(confirmingArchive);
                                        }
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

const FilterChip: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${active ? 'bg-[var(--accent-primary)] text-[var(--text-contrast)] shadow-md' : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-interactive-hover)]'}`}
    >
        {label}
    </button>
);


export default TransactionHistory;