
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Transaction } from '../types';
import { HapticService } from '../services/hapticService';
import { useCategories } from '../contexts/CategoryContext';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';

interface QuickAddModalProps {
    initialData: Partial<Transaction>;
    onClose: () => void;
    // Fix: Updated type to include optional date
    onSave: (transaction: Omit<Transaction, 'id' | 'userId'>) => void;
}

const QuickAddModal: React.FC<QuickAddModalProps> = ({ initialData, onClose, onSave }) => {
    const [amount, setAmount] = useState(initialData.amount?.toString() || '');
    const [item, setItem] = useState(initialData.item || '');
    const [quantity, setQuantity] = useState(initialData.quantity || '');
    const [kilometers, setKilometers] = useState(initialData.kilometers?.toString() || '');
    const [usageType, setUsageType] = useState<string>(initialData.usageType || 'none');
    const { getCategory } = useCategories();
    const { addToast } = useNotification();
    const { t } = useLanguage();

    const category = initialData.categoryId ? getCategory(initialData.categoryId) : null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Allow amount to be 0 for vehicle logs
        const isVehicleTrip = item === 'Vehicle Trip';
        const isVehicleLog = category?.name === 'Fuel' || isVehicleTrip;
        const parsedAmount = parseFloat(amount);
        
        if ((isNaN(parsedAmount) && !isVehicleLog) || !initialData.type || !initialData.categoryId || !item || !initialData.currency) {
            HapticService.notificationError();
            addToast(t('notifications.amountRequired'), "error");
            return;
        }
        
        HapticService.impactMedium();
        onSave({
            type: initialData.type,
            categoryId: initialData.categoryId,
            item: item,
            amount: isNaN(parsedAmount) ? 0 : parsedAmount,
            currency: initialData.currency,
            date: new Date(),
            quantity: quantity || undefined,
            kilometers: kilometers ? parseInt(kilometers, 10) : (initialData.kilometers || undefined),
            usageType: usageType !== 'none' ? usageType as any : (initialData.usageType || undefined),
            subCategoryId: initialData.subCategoryId,
        });
    };

    const inputClasses = "w-full bg-[var(--bg-tertiary)] rounded-lg p-2 text-[var(--text-primary)] border-2 border-transparent focus:border-[var(--accent-primary)] focus:outline-none";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border-primary-translucent)]"
            >
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <h2 className="text-xl font-bold text-[var(--text-white)] text-center">
                        {t('quickAdd.title', { 
                            item: item ? (t(`quickAddItems.${item}`) === `quickAddItems.${item}` ? item : t(`quickAddItems.${item}`)) : '' 
                        })}
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {!(item === 'Vehicle Trip') && (
                            <>
                                <div>
                                    <label htmlFor="item" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('transactionForm.item')}</label>
                                    <input 
                                        type="text" 
                                        name="item" 
                                        id="item" 
                                        value={item} 
                                        onChange={(e) => setItem(e.target.value)} 
                                        className={inputClasses}
                                        placeholder={t('transactionForm.itemPlaceholder')}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="amount" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('quickAdd.amount', { currency: initialData.currency || '' })}</label>
                                        <input 
                                            type="number" 
                                            name="amount" 
                                            id="amount" 
                                            value={amount} 
                                            onChange={(e) => setAmount(e.target.value)} 
                                            className={inputClasses}
                                            placeholder={t('quickAdd.amountPlaceholder')}
                                            required
                                        />
                                    </div>
                                    <div>
                                         <label htmlFor="quantity" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('quickAdd.quantity')}</label>
                                         <input
                                            type="text"
                                            name="quantity"
                                            id="quantity"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            className={inputClasses}
                                            placeholder={t('quickAdd.quantityPlaceholder')}
                                         />
                                    </div>
                                </div>
                            </>
                        )}

                        {(category?.name === 'Fuel' || item === 'Vehicle Trip') && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="kilometers" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        {initialData.item === 'Vehicle Trip' ? t('trip.distance') : t('quickAdd.odometer')}
                                    </label>
                                    <input
                                        type="number"
                                        name="kilometers"
                                        id="kilometers"
                                        value={kilometers}
                                        onChange={(e) => setKilometers(e.target.value)}
                                        className={inputClasses}
                                        placeholder={t('quickAdd.odometerPlaceholder')}
                                        autoFocus={initialData.item === 'Vehicle Trip'}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="usageType" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('transactionForm.usageType')}</label>
                                    <select 
                                        name="usageType" 
                                        id="usageType" 
                                        value={usageType} 
                                        onChange={(e) => setUsageType(e.target.value)} 
                                        className={inputClasses}
                                    >
                                        <option value="none">{t('transactionForm.none')}</option>
                                        <option value="business">{t('transactionForm.business')}</option>
                                        <option value="personal">{t('transactionForm.personal')}</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end items-center space-x-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-interactive-hover)] transition-colors">
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[var(--positive)] text-white hover:opacity-90 transition-opacity font-semibold">
                            <Check size={16} /><span>{t('common.save')}</span>
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default QuickAddModal;
