
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, Currency } from '../types';
import { getIconComponent } from '../utils/helpers';
import { Edit, Receipt, Layers, ChevronDown, ChevronUp, Gauge, Trash2, Archive } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { HapticService } from '../services/hapticService';
import { useCategories } from '../contexts/CategoryContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface TransactionItemProps {
    transaction: Transaction;
    index: number;
    onEdit: () => void;
    onDelete: () => void;
    onArchive: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, index, onEdit, onDelete, onArchive }) => {
    const { preferredCurrency, convertAmount, getDecimalPlaces } = useCurrency();
    const { getCategory, getSubCategory } = useCategories();
    const { t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);
    
    const [isDeleting, setIsDeleting] = useState(false);
    
    const { type, item, amount, currency, categoryId, subCategoryId, merchant, receiptImages, lineItems, kilometers, usageType, isArchived } = transaction;
    const isTrip = (transaction as any).isTrip;

    const category = getCategory(categoryId);
    const subCategory = subCategoryId ? getSubCategory(subCategoryId) : null;
    const Icon = getIconComponent(category?.icon);
    
    const isIncome = type === 'income';

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delay: index * 0.05,
            },
        },
    };

    const formatNumber = (num: number, cur: Currency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            maximumFractionDigits: getDecimalPlaces(cur),
            minimumFractionDigits: getDecimalPlaces(cur),
        }).format(num);
    };

    const formatDisplayAmount = () => {
        const sign = isIncome ? '' : '-';
        
        if (amount === 0) {
            return (
                <p className="font-bold text-sm md:text-base whitespace-nowrap text-[var(--text-tertiary)] italic">
                    {t('transactionItem.logOnly')}
                </p>
            );
        }

        if (currency === preferredCurrency) {
            return (
                <p className={`font-bold text-sm md:text-base whitespace-nowrap ${isIncome ? 'text-[var(--positive-text)]' : 'text-[var(--negative-text)]'}`}>
                    {sign}{formatNumber(amount, currency)} <span className="text-[9px] md:text-[10px] font-medium opacity-60 uppercase">{currency}</span>
                </p>
            );
        }

        const convertedAmount = convertAmount(amount, currency, preferredCurrency);
        
        return (
            <div className="flex flex-col items-end leading-tight">
                <p className={`font-bold text-sm md:text-base whitespace-nowrap ${isIncome ? 'text-[var(--positive-text)]' : 'text-[var(--negative-text)]'}`}>
                    {sign}{formatNumber(convertedAmount, preferredCurrency)} <span className="text-[9px] md:text-[10px] font-medium opacity-60 uppercase">{preferredCurrency}</span>
                </p>
                <span className="text-[9px] md:text-[10px] text-[var(--text-tertiary)] font-mono">
                    {sign}{formatNumber(amount, currency)} {currency}
                </span>
            </div>
        );
    };

    const hasImages = receiptImages && receiptImages.length > 0;
    const isMultiImage = receiptImages && receiptImages.length > 1;
    const hasLineItems = lineItems && lineItems.length > 0;

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isDeleting) {
            HapticService.impactMedium();
            onDelete();
            HapticService.notificationSuccess();
        } else {
            HapticService.impactLight();
            setIsDeleting(true);
            setTimeout(() => setIsDeleting(false), 3000);
        }
    };

    return (
        <motion.div
            layout
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="bg-[var(--bg-secondary-translucent)] rounded-xl overflow-hidden border border-[var(--border-primary-translucent)] hover:border-[var(--border-primary)] transition-all shadow-sm"
        >
            <div className="flex items-center space-x-3 p-3 md:p-4">
                <div 
                    onClick={() => hasLineItems && setIsExpanded(!isExpanded)}
                    className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center bg-[var(--bg-tertiary)] shadow-inner shrink-0 ${hasLineItems ? 'cursor-pointer hover:bg-[var(--accent-primary-light)]/20 transition-colors' : ''}`}
                >
                    <Icon size={20} className="text-[var(--accent-primary-light)]" />
                </div>
                
                <div 
                    className={`flex-grow min-w-0 ${hasLineItems ? 'cursor-pointer' : ''}`} 
                    onClick={() => hasLineItems && setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <p className="font-bold text-[var(--text-white)] text-sm md:text-base leading-tight break-words">
                            {t(`quickAddItems.${item}`) === `quickAddItems.${item}` ? item : t(`quickAddItems.${item}`)}
                        </p>
                        {hasLineItems && (
                            <span className="bg-[var(--bg-tertiary)] text-[8px] md:text-[9px] px-1.5 py-0.5 rounded-full text-[var(--text-secondary)] font-bold border border-[var(--border-primary-translucent)] uppercase shrink-0">
                                {lineItems.length}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        {merchant && (
                            <span className="text-[9px] md:text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide whitespace-nowrap">
                                {merchant}
                            </span>
                        )}
                        {merchant && (category?.name || subCategory) && <span className="text-[9px] text-[var(--text-tertiary)] opacity-50">•</span>}
                        
                        <p className="text-[9px] md:text-[10px] text-[var(--text-tertiary)] whitespace-nowrap">
                            {category?.name} {subCategory && `/ ${subCategory.name}`}
                        </p>
                        
                        {kilometers && (
                            <>
                                <span className="text-[9px] text-[var(--text-tertiary)] opacity-50">•</span>
                                <div className="flex items-center gap-1 text-[var(--accent-primary-light)] text-[8px] md:text-[9px] font-bold uppercase tracking-tighter whitespace-nowrap">
                                    <Gauge size={10} />
                                    {kilometers} KM
                                </div>
                            </>
                        )}
                        
                        {usageType && usageType !== 'none' && (
                            <>
                                <span className="text-[9px] text-[var(--text-tertiary)] opacity-50">•</span>
                                <span className={`text-[8px] md:text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md whitespace-nowrap ${usageType === 'business' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                    {t(`transactionForm.${usageType}`)}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0 border-s border-[var(--border-primary-translucent)] ps-2 md:ps-3 min-w-[90px] md:min-w-[110px]">
                    <div className="shrink-0 text-end">
                        {formatDisplayAmount()}
                    </div>
                    
                    <div className="flex items-center space-x-1 md:space-x-2">
                        {hasImages && (
                            <div className="text-[var(--text-tertiary)] hover:text-[var(--accent-primary-light)] transition-colors relative p-1" title={t('common.receipt')}>
                                {isMultiImage ? <Layers size={14} /> : <Receipt size={14} />}
                                {isMultiImage && (
                                    <span className="absolute -top-1 -end-1 bg-[var(--accent-primary)] text-white text-[7px] font-bold rounded-full w-3 h-3 flex items-center justify-center border border-[var(--bg-secondary)]">
                                        {receiptImages.length}
                                    </span>
                                )}
                            </div>
                        )}
                        
                        {!isTrip && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors rounded-lg hover:bg-[var(--bg-interactive-hover)]"
                                aria-label="Edit transaction"
                            >
                                <Edit size={14} />
                            </button>
                        )}

                        <button
                            onClick={(e) => { e.stopPropagation(); onArchive(); }}
                            className={`p-1.5 transition-all rounded-lg flex items-center gap-1 ${isArchived ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10' : 'text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10'}`}
                            aria-label={isArchived ? "Unarchive transaction" : "Archive transaction"}
                            title={isArchived ? t('common.unarchive') : t('common.archive')}
                        >
                            <Archive size={14} />
                        </button>

                        <button
                            onClick={handleDelete}
                            className={`p-1.5 transition-all rounded-lg flex items-center gap-1 ${isDeleting ? 'bg-red-500 text-white px-2' : 'text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-500/10'}`}
                            aria-label="Delete transaction"
                        >
                            <Trash2 size={14} />
                            {isDeleting && <span className="text-[10px] font-bold uppercase">{t('transactionItem.confirm')}</span>}
                        </button>

                        {hasLineItems && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                                className={`p-1 text-[var(--text-tertiary)] transition-all rounded-full hover:bg-[var(--bg-interactive-hover)] ${isExpanded ? 'text-[var(--accent-primary-light)] bg-[var(--bg-tertiary)]' : ''}`}
                            >
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && hasLineItems && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-[var(--bg-tertiary)]/30 border-t border-[var(--border-primary-translucent)]"
                    >
                        <div className="p-4 space-y-2.5">
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.1em]">{t('transactionItem.breakdown')}</p>
                                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">{currency}</span>
                            </div>
                            {lineItems.map((line, lIdx) => (
                                <div key={line.id || lIdx} className="flex justify-between items-center group/item">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-1 h-1 rounded-full bg-[var(--text-tertiary)] opacity-30 group-hover/item:bg-[var(--accent-primary-light)] transition-colors" />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm text-[var(--text-primary)] font-medium truncate">{line.item}</span>
                                            {line.quantity && <span className="text-[10px] text-[var(--text-tertiary)] leading-none mt-0.5">{line.quantity}</span>}
                                        </div>
                                    </div>
                                    <span className="text-[var(--text-white)] font-mono text-xs font-semibold ms-4">
                                        {formatNumber(line.amount, currency)}
                                    </span>
                                </div>
                            ))}
                            {kilometers && (
                                <div className="pt-2 mt-1 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Gauge size={12} className="text-[var(--text-tertiary)]" />
                                        <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">{t('transactionItem.odometerReading')}</span>
                                    </div>
                                    <span className="text-[var(--text-white)] font-mono text-xs font-semibold">{kilometers} KM</span>
                                </div>
                            )}
                            <div className="pt-2.5 mt-2.5 border-t border-[var(--border-primary-translucent)] flex justify-between items-center">
                                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">{t('transactionItem.verifiedTotal')}</span>
                                <span className="text-sm font-bold text-[var(--text-white)] font-mono">
                                    {formatNumber(amount, currency)} <span className="text-[10px] opacity-60 font-medium uppercase">{currency}</span>
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default TransactionItem;
