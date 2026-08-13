
import React, { useState, useEffect } from 'react';
import { Check, RefreshCw } from 'lucide-react';
import { Transaction, SubCategory, DistanceUnit } from '../types';
import { HapticService } from '../services/hapticService';
import { useCategories } from '../contexts/CategoryContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { convertDistance, toDateInputValue, fromDateInputValue } from '../utils/helpers';

// Fix: Simplified FormData type to include the date field correctly
type FormData = Omit<Transaction, 'id' | 'userId'>;

interface TransactionFormProps {
    initialData: FormData;
    // Fix: Updated onSubmit to use the consistent Omit<Transaction, 'id' | 'userId'> type
    onSubmit: (data: Omit<Transaction, 'id' | 'userId'>) => void;
    onCancel: () => void;
    onRetry?: () => void;
    submitButtonText?: string;
    retryButtonText?: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    onRetry,
    submitButtonText = "Save",
    retryButtonText = "Retry",
}) => {
    const { categories, subCategories } = useCategories();
    const { allCurrencies } = useCurrency();
    const { t } = useLanguage();
    const { hasFeature, currentUser, business, isPersonalMode } = useAuth();
    const distanceUnit: DistanceUnit = (isPersonalMode ? currentUser?.distanceUnit : business?.settings?.distanceUnit) || 'km';

    // Convert initial kilometers to preferred unit for display
    const initialKilometers = initialData.kilometers 
        ? (distanceUnit === 'km' ? initialData.kilometers : convertDistance(initialData.kilometers, 'km', 'miles'))
        : undefined;

    const [formData, setFormData] = useState<FormData>({
        ...initialData,
        kilometers: initialKilometers
    });
    const [availableSubCategories, setAvailableSubCategories] = useState<SubCategory[]>([]);

    useEffect(() => {
        if (formData.categoryId) {
            setAvailableSubCategories(subCategories.filter(sc => sc.categoryId === formData.categoryId));
        } else {
            setAvailableSubCategories([]);
        }
    }, [formData.categoryId, subCategories]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'categoryId') {
            setFormData(prev => ({ ...prev, categoryId: value, subCategoryId: undefined }));
        } else if (name === 'date') {
            setFormData(prev => ({ ...prev, date: fromDateInputValue(value) }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: (name === 'amount' || name === 'kilometers') ? parseFloat(value) || 0 : value,
            }));
        }
    };

    // Fix: Updated handleSubmit to pass clean data without 'as any' casting
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        HapticService.impactMedium();
        
        // Convert distance back to KM for storage if currently in miles
        const kmValue = formData.kilometers 
            ? (distanceUnit === 'km' ? formData.kilometers : convertDistance(formData.kilometers, 'miles', 'km'))
            : undefined;

        const finalData: Omit<Transaction, 'id' | 'userId'> = {
            ...formData,
            quantity: formData.quantity || undefined,
            kilometers: kmValue,
            usageType: formData.usageType || undefined,
            subCategoryId: formData.subCategoryId || undefined,
            merchant: formData.merchant || undefined,
        };
        onSubmit(finalData);
    };

    const inputClasses = "w-full bg-[var(--bg-tertiary)] rounded-lg p-2 text-[var(--text-primary)] border-2 border-transparent focus:border-[var(--accent-primary)] focus:outline-none";
    const categoryForKilometers = categories.find(c => c.id === formData.categoryId)?.name;

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label htmlFor="date" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('transactionForm.date')}</label>
                    <input 
                        type="date" 
                        name="date" 
                        id="date" 
                        value={toDateInputValue(formData.date)} 
                        onChange={handleChange} 
                        className={inputClasses} 
                        required 
                    />
                </div>
                <div>
                    <label htmlFor="merchant" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('transactionForm.merchant')}</label>
                    <input type="text" name="merchant" id="merchant" value={formData.merchant || ''} onChange={handleChange} className={inputClasses} placeholder={t('transactionForm.merchantPlaceholder')} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor="item" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('transactionForm.item')}</label>
                    <input type="text" name="item" id="item" value={formData.item} onChange={handleChange} className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('transactionForm.quantity')}</label>
                    <input type="text" name="quantity" id="quantity" value={formData.quantity || ''} onChange={handleChange} className={inputClasses} placeholder="e.g. 10" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('transactionForm.amount')}</label>
                    <input type="number" step="any" name="amount" id="amount" value={formData.amount} onChange={handleChange} className={inputClasses} />
                </div>
                <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('transactionForm.currency')}</label>
                    <select name="currency" id="currency" value={formData.currency} onChange={handleChange} className={inputClasses}>
                        {allCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('transactionForm.category')}</label>
                    <select name="categoryId" id="categoryId" value={formData.categoryId} onChange={handleChange} className={inputClasses}>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="subCategoryId" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('transactionForm.subCategory')}</label>
                    <select name="subCategoryId" id="subCategoryId" value={formData.subCategoryId || ''} onChange={handleChange} className={inputClasses} disabled={availableSubCategories.length === 0}>
                        <option value="">{availableSubCategories.length > 0 ? t('transactionForm.selectSubCategory') : t('transactionForm.noSubCategory')}</option>
                        {availableSubCategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                    </select>
                </div>
            </div>
            {hasFeature('VEHICLE_TRACKING') && (categoryForKilometers === 'Fuel' || formData.kilometers) && (
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="kilometers" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                            {t('transactionForm.odometer')} ({distanceUnit.toUpperCase()})
                        </label>
                        <input type="number" name="kilometers" id="kilometers" value={formData.kilometers || ''} onChange={handleChange} className={inputClasses} placeholder={t('transactionForm.odometerPlaceholder')} />
                    </div>
                    <div>
                        <label htmlFor="usageType" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('transactionForm.usageType')}</label>
                        <select name="usageType" id="usageType" value={formData.usageType || 'none'} onChange={handleChange} className={inputClasses}>
                            <option value="none">{t('transactionForm.none')}</option>
                            <option value="business">{t('transactionForm.business')}</option>
                            <option value="personal">{t('transactionForm.personal')}</option>
                        </select>
                    </div>
                </div>
            )}
            <div className="flex justify-between items-center space-x-2 pt-2">
                {onRetry && (
                    <button type="button" onClick={onRetry} className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-interactive-hover)] transition-colors">
                        <RefreshCw size={16} /><span>{retryButtonText}</span>
                    </button>
                )}
                <div className="flex-grow flex justify-end space-x-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-interactive-hover)] transition-colors">
                        {t('common.cancel')}
                    </button>
                    <button type="submit" className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[var(--positive)] text-white hover:opacity-90 transition-opacity font-semibold">
                        <Check size={16} /><span>{submitButtonText}</span>
                    </button>
                </div>
            </div>
        </form>
    );
};

export default TransactionForm;
