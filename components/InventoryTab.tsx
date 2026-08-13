
import React, { useState, useEffect } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useNotification } from '../contexts/NotificationContext';
import { useCategories } from '../contexts/CategoryContext';
import { useAuth } from '../contexts/AuthContext';
import { ProductionBatch, InventoryProduct } from '../types';
import { 
    Plus, 
    Box, 
    History, 
    Activity, 
    TrendingDown, 
    TrendingUp, 
    Calendar, 
    Layers, 
    FlaskConical,
    Save,
    X,
    ChevronRight,
    Search,
    Package,
    Settings,
    Trash2,
    Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HapticService } from '../services/hapticService';

interface InventoryTabProps {
    addTransaction: (data: any) => Promise<void>;
    initialShowAddModal?: boolean;
    onModalClose?: () => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({ addTransaction, initialShowAddModal = false, onModalClose }) => {
    const { 
        batches, 
        inventory, 
        products,
        addBatch, 
        updateBatch,
        deleteBatch,
        updateBatchStatus, 
        sellItems, 
        setInitialStock, 
        addProduct,
        updateProduct,
        deleteProduct,
        isLoading,
        canModify
    } = useInventory();
    
    const { t } = useLanguage();
    const { preferredCurrency } = useCurrency();
    const { addToast } = useNotification();
    const { findCategoryByName, subCategories } = useCategories();
    const { currentUser } = useAuth();

    const isAdmin = canModify(currentUser?.role);

    const [isAddModalOpen, setIsAddModalOpen] = useState(initialShowAddModal);
    const [isSellModalOpen, setIsSellModalOpen] = useState(false);
    const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
    const [isMpaModalOpen, setIsMpaModalOpen] = useState(false);
    const [isInitialStockModalOpen, setIsInitialStockModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isEditBatchModalOpen, setIsEditBatchModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null);
    const [editingBatch, setEditingBatch] = useState<ProductionBatch | null>(null);
    const [batchToDelete, setBatchToDelete] = useState<string | null>(null);
    const [testDays, setTestDays] = useState('28');

    // Sync modal state with prop
    React.useEffect(() => {
        if (initialShowAddModal) {
            setIsAddModalOpen(true);
        }
    }, [initialShowAddModal]);

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        onModalClose?.();
    };

    // Form states
    const [newBatch, setNewBatch] = useState({
        productType: products[0]?.name || '',
        quantityProduced: 1000,
        cementBagsUsed: 12,
        batchId: `BATCH-${new Date().getTime().toString().slice(-6)}`
    });

    const [saleData, setSaleData] = useState({
        productType: products[0]?.name || '',
        quantity: 100,
        pricePerUnit: 0.5,
        currency: preferredCurrency
    });

    const [usageData, setUsageData] = useState({
        productType: products[0]?.name || '',
        quantity: 10,
        description: ''
    });

    useEffect(() => {
        const firstTracked = products.find(p => p.isTracked !== false);
        if (firstTracked) {
            setNewBatch(prev => ({ ...prev, productType: prev.productType || firstTracked.name }));
            setSaleData(prev => ({ ...prev, productType: prev.productType || firstTracked.name }));
            setUsageData(prev => ({ ...prev, productType: prev.productType || firstTracked.name }));
            setInitialStockValue(prev => ({ ...prev, productType: prev.productType || firstTracked.name }));
        }
    }, [products]);

    const [mpaValue, setMpaValue] = useState<number | string>('');
    const [initialStock, setInitialStockValue] = useState({ productType: products[0]?.name || '', quantity: 0 });
    
    const [newProduct, setNewProduct] = useState({ name: '', unit: 'items' });
    const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);

    const handleAddBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        HapticService.impactMedium();
        await addBatch({
            batchId: newBatch.batchId,
            date: new Date(),
            productType: newBatch.productType,
            quantityProduced: newBatch.quantityProduced,
            cementBagsUsed: newBatch.cementBagsUsed,
            curingStartDate: new Date()
        });
        handleCloseAddModal();
        setNewBatch(prev => ({ ...prev, batchId: `BATCH-${new Date().getTime().toString().slice(-6)}` }));
        HapticService.notificationSuccess();
    };

    const handleSellItems = async (e: React.FormEvent) => {
        e.preventDefault();
        HapticService.impactMedium();
        const totalAmount = saleData.quantity * saleData.pricePerUnit;
        
        try {
            const product = products.find(p => p.name === saleData.productType);
            const unitName = product?.unit || 'items';
            
            // Try to find a relevant category
            const salesCategory = findCategoryByName('Sales') || findCategoryByName('Income');
            const saleSub = subCategories.find(s => s.name.toLowerCase().includes('sale') && s.categoryId === salesCategory?.id);

            await addTransaction({
                type: 'income',
                amount: totalAmount,
                currency: saleData.currency,
                item: `Sale of ${saleData.quantity} ${unitName} (${saleData.productType})`,
                categoryId: salesCategory?.id || 'cat-income',
                subCategoryId: saleSub?.id,
                date: new Date()
            });

            await sellItems(saleData.productType, saleData.quantity);
            setIsSellModalOpen(false);
            addToast(t('inventory.saleSuccess'), 'success');
            HapticService.notificationSuccess();
        } catch (error) {
            HapticService.notificationError();
            console.error(error);
        }
    };

    const handleRecordUsage = async (e: React.FormEvent) => {
        e.preventDefault();
        HapticService.impactMedium();
        try {
            await sellItems(usageData.productType, usageData.quantity);
            setIsUsageModalOpen(false);
            addToast(t('inventory.usageSuccess'), 'success');
            HapticService.notificationSuccess();
        } catch (error) {
            addToast(t('inventory.insufficientStock'), 'error');
            HapticService.notificationError();
        }
    };

    const handleUpdateMpa = async (e: React.FormEvent) => {
        e.preventDefault();
        HapticService.impactMedium();
        if (!selectedBatch || !mpaValue) return;

        // Check curing age
        if (selectedBatch.curingStartDate) {
            const { days } = calculateCuringProgress(selectedBatch.curingStartDate);
            if (days < 7) {
                addToast(t('inventory.testTooEarlyDesc'), 'error');
                return;
            }
        }

        try {
            // Deduct 1 unit for testing
            await sellItems(selectedBatch.productType, 1);

            const newTest = {
                id: crypto.randomUUID(),
                date: new Date(),
                result: parseFloat(mpaValue.toString()),
                daysSinceCuring: parseInt(testDays)
            };

            const updatedTests = [...(selectedBatch.strengthTests || []), newTest];
            
            // Find the highest result for the main mpaTestResult field (backward compatibility)
            const highestResult = Math.max(...updatedTests.map(t => t.result));

            await updateBatch(selectedBatch.id, {
                strengthTests: updatedTests,
                mpaTestResult: highestResult,
                mpaTestDate: new Date(),
                status: 'tested'
            });

            setMpaValue('');
            setIsMpaModalOpen(false);
            setSelectedBatch(null);
            addToast(t('inventory.saveResult'), 'success');
            HapticService.notificationSuccess();
        } catch (error) {
            HapticService.notificationError();
            addToast(t('inventory.insufficientStock'), 'error');
        }
    };

    const handleDeleteBatch = async () => {
        if (batchToDelete) {
            HapticService.impactMedium();
            await deleteBatch(batchToDelete);
            setIsDeleteConfirmOpen(false);
            setBatchToDelete(null);
            HapticService.notificationSuccess();
        }
    };

    const handleEditBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBatch) return;
        await updateBatch(editingBatch.id, editingBatch);
        setIsEditBatchModalOpen(false);
        setEditingBatch(null);
    };

    const calculateCuringProgress = (startDate: Date) => {
        const start = new Date(startDate).getTime();
        const now = new Date().getTime();
        const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        const progress = Math.min(100, Math.max(0, (diffDays / 28) * 100));
        return { progress, days: diffDays };
    };

    const handleSetInitialStock = async (e: React.FormEvent) => {
        e.preventDefault();
        HapticService.impactMedium();
        await setInitialStock(initialStock.productType, initialStock.quantity);
        setIsInitialStockModalOpen(false);
        HapticService.notificationSuccess();
    };

    const getSuggestedUnit = (name: string): string => {
        const n = name.toLowerCase();
        if (n.includes('gravel')) return 'm³';
        if (n.includes('sand')) return 'm³';
        if (n.includes('cement')) return 'bags';
        if (n.includes('block')) return 'units';
        if (n.includes('soap')) return 'bars';
        if (n.includes('fuel') || n.includes('diesel') || n.includes('petrol')) return 'liters';
        if (n.includes('water')) return 'liters';
        if (n.includes('oil')) return 'liters';
        if (n.includes('wood')) return 'm³';
        if (n.includes('metal') || n.includes('steel') || n.includes('iron')) return 'kg';
        if (n.includes('paint')) return 'liters';
        return 'items';
    };

    const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const suggestedUnit = getSuggestedUnit(name);
        setNewProduct(prev => ({
            ...prev,
            name,
            unit: (prev.unit === 'items' || prev.unit === '') ? suggestedUnit : prev.unit
        }));
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        HapticService.impactMedium();
        if (editingProduct) {
            await updateProduct(editingProduct.id, newProduct);
            setEditingProduct(null);
        } else {
            await addProduct(newProduct);
        }
        setNewProduct({ name: '', unit: 'items' });
        HapticService.notificationSuccess();
    };

    return (
        <div className="p-4 space-y-6 pb-24">
            {/* Header / Summary */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">{t('inventory.title')}</h2>
                    <p className="text-sm text-[var(--text-secondary)]">{t('inventory.subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    {isAdmin && (
                        <button 
                            onClick={() => setIsProductModalOpen(true)}
                            className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded-full transition-colors"
                            title={t('inventory.manageProducts')}
                        >
                            <Settings size={20} />
                        </button>
                    )}
                </div>
            </div>

            {products.length === 0 && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[var(--accent-primary-bg-light)] p-6 rounded-2xl border-2 border-dashed border-[var(--accent-primary-light)]/30 text-center"
                >
                    <Package className="mx-auto text-[var(--accent-primary)] mb-3" size={48} />
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{t('inventory.noProducts')}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-xs mx-auto">
                        {t('inventory.noProductsDesc')}
                    </p>
                    <button 
                        onClick={() => setIsProductModalOpen(true)}
                        className="w-full py-3 bg-[var(--accent-primary)] text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Plus size={20} />
                        {t('inventory.addFirstProduct')}
                    </button>
                </motion.div>
            )}

            {/* Inventory Grid */}
            <div className="grid grid-cols-2 gap-4">
                {products.filter(p => p.isTracked !== false).map(product => {
                    const inv = inventory.find(i => i.productType === product.name);
                    return (
                        <div key={product.id} className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-primary-translucent)]">
                            <div className="flex items-center gap-2 text-[var(--text-tertiary)] mb-1">
                                <Box size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-wider truncate">{product.name}</span>
                            </div>
                            <div className="text-2xl font-bold text-[var(--text-primary)]">
                                {inv?.totalQuantity || 0}
                            </div>
                            <div className="text-[10px] text-[var(--text-tertiary)] mt-1 font-medium capitalize">
                                {product.unit} {t('inventory.available')}
                            </div>
                        </div>
                    );
                })}
                {products.length === 0 && (
                    <div className="col-span-2 text-center py-8 bg-[var(--bg-secondary)] rounded-xl border border-dashed border-[var(--border-primary-translucent)]">
                        <p className="text-sm text-[var(--text-secondary)]">{t('inventory.noProductsDefined')}</p>
                        <button 
                            onClick={() => setIsProductModalOpen(true)}
                            className="mt-2 text-xs font-bold text-[var(--accent-primary)]"
                        >
                            {t('inventory.addFirstProductAction')}
                        </button>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex flex-col items-center justify-center p-4 bg-[var(--accent-primary-bg-light)] rounded-xl border border-[var(--accent-primary-light)]/20 hover:bg-[var(--accent-primary-bg-translucent)] transition-colors group"
                >
                    <div className="p-3 bg-[var(--accent-primary)] text-white rounded-full mb-2 group-hover:scale-110 transition-transform">
                        <Plus size={24} />
                    </div>
                    <div className="font-bold text-[var(--text-primary)] text-xs text-center">{t('inventory.recordProduction')}</div>
                    <div className="text-[10px] text-[var(--text-secondary)] text-center">{t('inventory.addBatchDesc')}</div>
                </button>

                <button 
                    onClick={() => setIsSellModalOpen(true)}
                    className="flex flex-col items-center justify-center p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary-translucent)] hover:bg-[var(--bg-interactive-hover)] transition-colors group"
                >
                    <div className="p-3 bg-[var(--bg-tertiary)] text-[var(--accent-primary-light)] rounded-full mb-2 group-hover:scale-110 transition-transform">
                        <TrendingUp size={24} />
                    </div>
                    <div className="font-bold text-[var(--text-primary)] text-xs text-center">{t('inventory.recordSale')}</div>
                    <div className="text-[10px] text-[var(--text-secondary)] text-center">{t('inventory.recordSaleDesc')}</div>
                </button>

                <button 
                    onClick={() => setIsUsageModalOpen(true)}
                    className="flex flex-col items-center justify-center p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary-translucent)] hover:bg-[var(--bg-interactive-hover)] transition-colors group"
                >
                    <div className="p-3 bg-[var(--bg-tertiary)] text-[var(--warning-text)] rounded-full mb-2 group-hover:scale-110 transition-transform">
                        <TrendingDown size={24} />
                    </div>
                    <div className="font-bold text-[var(--text-primary)] text-xs text-center">{t('inventory.recordUsage')}</div>
                    <div className="text-[10px] text-[var(--text-secondary)] text-center">{t('inventory.recordUsageDesc')}</div>
                </button>

                <button 
                    onClick={() => setIsInitialStockModalOpen(true)}
                    className="flex flex-col items-center justify-center p-4 bg-[var(--warning-bg-light)]/30 rounded-xl border border-[var(--warning-text)]/20 hover:bg-[var(--warning-bg-light)]/50 transition-colors group"
                >
                    <div className="p-3 bg-[var(--warning-bg-light)] text-[var(--warning-text)] rounded-full mb-2 group-hover:scale-110 transition-transform">
                        <Package size={24} />
                    </div>
                    <div className="font-bold text-[var(--text-primary)] text-xs text-center">{t('inventory.setInitialStock')}</div>
                    <div className="text-[10px] text-[var(--text-secondary)] text-center">{t('inventory.setInitialStockDesc')}</div>
                </button>
            </div>

            {/* Production History */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <History size={20} className="text-[var(--text-tertiary)]" />
                        {t('inventory.recentActivity')}
                    </h3>
                </div>

                <div className="space-y-3">
                    {batches.length === 0 ? (
                        <div className="text-center py-12 bg-[var(--bg-primary)] rounded-xl border-2 border-dashed border-[var(--border-primary-translucent)]">
                            <Layers className="mx-auto text-[var(--text-tertiary)] mb-2" size={40} />
                            <p className="text-[var(--text-secondary)]">{t('inventory.noActivity')}</p>
                        </div>
                    ) : (
                        batches.map(batch => (
                            <div key={batch.id} className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-primary-translucent)]">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[var(--text-primary)]">{batch.batchId}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                                batch.status === 'tested' || batch.status === 'completed' ? 'bg-[var(--positive-bg-light)] text-[var(--positive-text)]' :
                                                batch.status === 'ready' ? 'bg-[var(--accent-primary-bg-light)] text-[var(--accent-primary-light)]' :
                                                'bg-[var(--warning-bg-light)] text-[var(--warning-text)]'
                                            }`}>
                                                {batch.status === 'tested' ? t('inventory.mpaResult') : 
                                                 batch.status === 'completed' ? t('inventory.completed') : 
                                                 batch.status === 'ready' ? t('inventory.ready') :
                                                 batch.status === 'curing' ? t('inventory.curing') :
                                                 t('inventory.pending')}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1 mt-1">
                                            <Calendar size={12} />
                                            {batch.date.toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {isAdmin && (
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    onClick={() => {
                                                        setEditingBatch(batch);
                                                        setIsEditBatchModalOpen(true);
                                                    }}
                                                    className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent-primary-light)] transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setBatchToDelete(batch.id);
                                                        setIsDeleteConfirmOpen(true);
                                                    }}
                                                    className="p-2 text-[var(--text-tertiary)] hover:text-[var(--negative-text)] transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-[var(--text-primary)]">{batch.quantityProduced}</div>
                                            <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold">{batch.productType}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                {batch.productType.toLowerCase().includes('block') && batch.curingStartDate && (
                                    <div className="mb-4">
                                        <div className="flex justify-between text-[10px] mb-1.5">
                                            <span className="text-[var(--text-tertiary)] uppercase font-bold">{t('inventory.curingProgress')}</span>
                                            <span className="text-[var(--text-secondary)] font-bold">
                                                {calculateCuringProgress(batch.curingStartDate).days} / 28 {t('inventory.days')}
                                                {calculateCuringProgress(batch.curingStartDate).days >= 28 && ` (${t('inventory.cured')})`}
                                            </span>
                                        </div>
                                        <div className="w-full bg-[var(--bg-tertiary)] h-2 rounded-full overflow-hidden">
                                            <div 
                                                className={`${calculateCuringProgress(batch.curingStartDate).days >= 28 ? 'bg-[var(--positive-text)]' : 'bg-[var(--accent-primary-light)]'} h-full transition-all duration-500`}
                                                style={{ width: `${calculateCuringProgress(batch.curingStartDate).progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                {batch.productType.toLowerCase().includes('block') && (
                                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-[var(--border-primary-translucent)]">
                                        <div>
                                            <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold mb-1">{t('inventory.cementBags')}</div>
                                            <div className="text-sm font-medium text-[var(--text-secondary)]">{batch.cementBagsUsed} {t('quickAddItems.cementBag')}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold mb-1">{t('inventory.mpaResult')}</div>
                                            <div className="text-sm font-medium text-[var(--text-secondary)]">
                                                {batch.mpaTestResult ? `${batch.mpaTestResult} MPa` : t('inventory.pending')}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(batch.status === 'curing' || batch.status === 'tested') && batch.productType.toLowerCase().includes('block') && (
                                    <div className="flex gap-2 mt-3">
                                        <button 
                                            onClick={() => {
                                                setSelectedBatch(batch);
                                                setIsMpaModalOpen(true);
                                            }}
                                            className="flex-1 py-2 text-xs font-bold text-[var(--positive-text)] bg-[var(--positive-bg-light)] rounded-lg hover:opacity-80 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FlaskConical size={14} />
                                            {t('inventory.enterMpa')}
                                        </button>
                                        {batch.status === 'tested' && (
                                            <button 
                                                onClick={() => updateBatchStatus(batch.id, 'completed')}
                                                className="px-4 py-2 text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-lg hover:opacity-80 transition-colors"
                                            >
                                                {t('inventory.markCompleted')}
                                            </button>
                                        )}
                                    </div>
                                )}
                                
                                {batch.status === 'curing' && !batch.productType.toLowerCase().includes('block') && (
                                    <button 
                                        onClick={() => updateBatchStatus(batch.id, 'completed')}
                                        className="w-full mt-3 py-2 text-xs font-bold text-[var(--positive-text)] bg-[var(--positive-bg-light)] rounded-lg hover:opacity-80 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {t('inventory.markCompleted')}
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <Modal title={t('inventory.recordProduction')} onClose={handleCloseAddModal}>
                        <form onSubmit={handleAddBatch} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">{t('inventory.batchId')}</label>
                                <input 
                                    type="text" 
                                    value={newBatch.batchId}
                                    onChange={e => setNewBatch({...newBatch, batchId: e.target.value})}
                                    className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl focus:ring-2 focus:ring-[var(--positive)] outline-none"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">{t('inventory.productType')}</label>
                                    <select 
                                        value={newBatch.productType}
                                        onChange={e => setNewBatch({...newBatch, productType: e.target.value})}
                                        className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl outline-none"
                                    >
                                        {products.filter(p => p.isTracked !== false).map((p, pIdx) => <option key={`${p.id}-${pIdx}`} value={p.name}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">{t('inventory.quantity')}</label>
                                    <input 
                                        type="number" 
                                        value={newBatch.quantityProduced === 0 ? '' : newBatch.quantityProduced}
                                        onChange={e => setNewBatch({...newBatch, quantityProduced: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                                        className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            {newBatch.productType.toLowerCase().includes('block') && (
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">{t('inventory.cementBags')}</label>
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        value={newBatch.cementBagsUsed === 0 ? '' : newBatch.cementBagsUsed}
                                        onChange={e => setNewBatch({...newBatch, cementBagsUsed: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                                        className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl outline-none"
                                        required
                                    />
                                </div>
                            )}
                            <button type="submit" className="w-full py-4 bg-[var(--positive)] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-colors">
                                {t('inventory.recordProduction')}
                            </button>
                        </form>
                    </Modal>
                )}

                {isSellModalOpen && (
                    <Modal title={t('inventory.recordSale')} onClose={() => setIsSellModalOpen(false)}>
                        <form onSubmit={handleSellItems} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">{t('inventory.productType')}</label>
                                <select 
                                    value={saleData.productType}
                                    onChange={e => setSaleData({...saleData, productType: e.target.value})}
                                    className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl outline-none"
                                >
                                    {products.filter(p => p.isTracked !== false).map((p, pIdx) => <option key={`${p.id}-${pIdx}`} value={p.name}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">{t('inventory.quantity')}</label>
                                    <input 
                                        type="number" 
                                        value={saleData.quantity === 0 ? '' : saleData.quantity}
                                        onChange={e => setSaleData({...saleData, quantity: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                                        className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">{t('inventory.pricePerUnit')}</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={saleData.pricePerUnit === 0 ? '' : saleData.pricePerUnit}
                                        onChange={e => setSaleData({...saleData, pricePerUnit: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                                        className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-[var(--accent-primary)] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-colors">
                                {t('inventory.recordSaleAndDeduct')}
                            </button>
                        </form>
                    </Modal>
                )}

                {isUsageModalOpen && (
                    <Modal title={t('inventory.recordUsage')} onClose={() => setIsUsageModalOpen(false)}>
                        <form onSubmit={handleRecordUsage} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">{t('inventory.productType')}</label>
                                <select 
                                    value={usageData.productType}
                                    onChange={e => setUsageData({...usageData, productType: e.target.value})}
                                    className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl outline-none"
                                >
                                    {products.filter(p => p.isTracked !== false).map((p, pIdx) => <option key={`${p.id}-${pIdx}`} value={p.name}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">{t('inventory.quantity')}</label>
                                <input 
                                    type="number" 
                                    value={usageData.quantity === 0 ? '' : usageData.quantity}
                                    onChange={e => setUsageData({...usageData, quantity: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                                    className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl outline-none"
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full py-4 bg-[var(--warning-bg-light)] text-[var(--warning-text)] font-bold rounded-xl shadow-lg hover:opacity-90 transition-colors">
                                {t('inventory.recordUsageAndDeduct')}
                            </button>
                        </form>
                    </Modal>
                )}

                {isMpaModalOpen && (
                    <Modal title={t('inventory.strengthTests')} onClose={() => setIsMpaModalOpen(false)}>
                        <div className="space-y-6">
                            {selectedBatch?.strengthTests && selectedBatch.strengthTests.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase mb-3">{t('inventory.testHistory')}</h4>
                                    <div className="space-y-2">
                                        {selectedBatch.strengthTests.map(test => (
                                            <div key={test.id} className="flex justify-between items-center p-3 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-primary-translucent)]">
                                                <div>
                                                    <div className="text-sm font-bold text-[var(--text-primary)]">{test.result} MPa</div>
                                                    <div className="text-[10px] text-[var(--text-tertiary)]">{test.daysSinceCuring} {t('inventory.days')}</div>
                                                </div>
                                                <div className="text-[10px] text-[var(--text-tertiary)]">
                                                    {new Date(test.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedBatch?.curingStartDate && calculateCuringProgress(selectedBatch.curingStartDate).days < 7 ? (
                                <div className="p-4 bg-[var(--warning-bg-light)] border border-[var(--warning-text)] rounded-xl">
                                    <div className="flex items-center gap-2 text-[var(--warning-text)] font-bold mb-2">
                                        <Activity size={18} />
                                        <span>{t('inventory.testTooEarly')}</span>
                                    </div>
                                    <p className="text-xs text-[var(--warning-text)] leading-relaxed">
                                        {t('inventory.testTooEarlyDesc')}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-[var(--warning-text)]/20">
                                        <p className="text-[10px] font-bold uppercase text-[var(--warning-text)]">
                                            Current Age: {calculateCuringProgress(selectedBatch.curingStartDate).days} days
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleUpdateMpa} className="space-y-4 pt-4 border-t border-[var(--border-primary-translucent)]">
                                    <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase">{t('inventory.addTest')}</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">{t('inventory.mpaValue')}</label>
                                            <input 
                                                type="number" 
                                                step="0.1"
                                                value={mpaValue}
                                                onChange={e => setMpaValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                                className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl outline-none"
                                                required
                                                autoFocus
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">{t('inventory.daysSinceCuring')}</label>
                                            <select 
                                            value={testDays}
                                            onChange={e => setTestDays(e.target.value)}
                                            className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl outline-none"
                                        >
                                            <option value="7">7 {t('inventory.days')}</option>
                                            <option value="15">15 {t('inventory.days')}</option>
                                            <option value="21">21 {t('inventory.days')}</option>
                                            <option value="28">28 {t('inventory.days')}</option>
                                        </select>
                                    </div>
                                </div>
                                <p className="text-[10px] text-[var(--text-tertiary)] italic">{t('inventory.testDeductionNotice')}</p>
                                <button type="submit" className="w-full py-4 bg-[var(--positive-bg-light)] text-[var(--positive-text)] font-bold rounded-xl shadow-lg hover:opacity-90 transition-colors">
                                    {t('inventory.saveResult')}
                                </button>
                                </form>
                            )}
                        </div>
                    </Modal>
                )}

                {isEditBatchModalOpen && editingBatch && (
                    <Modal title={t('inventory.editBatch')} onClose={() => setIsEditBatchModalOpen(false)}>
                        <form onSubmit={handleEditBatch} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">{t('inventory.batchId')}</label>
                                <input 
                                    type="text" 
                                    value={editingBatch.batchId}
                                    onChange={e => setEditingBatch({...editingBatch, batchId: e.target.value})}
                                    className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl outline-none"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">{t('inventory.quantity')}</label>
                                    <input 
                                        type="number" 
                                        value={editingBatch.quantityProduced === 0 ? '' : editingBatch.quantityProduced}
                                        onChange={e => setEditingBatch({...editingBatch, quantityProduced: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                                        className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">{t('inventory.curingStartDate')}</label>
                                    <input 
                                        type="date" 
                                        value={editingBatch.curingStartDate ? new Date(editingBatch.curingStartDate).toISOString().split('T')[0] : ''}
                                        onChange={e => setEditingBatch({...editingBatch, curingStartDate: new Date(e.target.value)})}
                                        className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl outline-none"
                                    />
                                </div>
                            </div>
                            {editingBatch.productType.toLowerCase().includes('block') && (
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">{t('inventory.cementBags')}</label>
                                    <input 
                                        type="number" 
                                        value={editingBatch.cementBagsUsed === 0 ? '' : (editingBatch.cementBagsUsed || 0)}
                                        onChange={e => setEditingBatch({...editingBatch, cementBagsUsed: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                                        className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl outline-none"
                                    />
                                </div>
                            )}
                            <button type="submit" className="w-full py-4 bg-[var(--accent-primary)] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-colors">
                                {t('inventory.update')}
                            </button>
                        </form>
                    </Modal>
                )}

                {isInitialStockModalOpen && (
                    <Modal title={t('inventory.updateInventory')} onClose={() => setIsInitialStockModalOpen(false)}>
                        <form onSubmit={handleSetInitialStock} className="space-y-4">
                            <p className="text-sm text-[var(--text-secondary)]">{t('inventory.setInitialStockDesc')}</p>
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">{t('inventory.productType')}</label>
                                <select 
                                    value={initialStock.productType}
                                    onChange={e => setInitialStockValue({...initialStock, productType: e.target.value})}
                                    className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl outline-none"
                                >
                                    {products.filter(p => p.isTracked !== false).map((p, pIdx) => <option key={`${p.id}-${pIdx}`} value={p.name}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">{t('inventory.quantity')}</label>
                                <input 
                                    type="number" 
                                    value={initialStock.quantity === 0 ? '' : initialStock.quantity}
                                    onChange={e => setInitialStockValue({...initialStock, quantity: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                                    className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl outline-none"
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full py-4 bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-bold rounded-xl shadow-lg hover:opacity-90 transition-colors">
                                {t('inventory.updateInventory')}
                            </button>
                        </form>
                    </Modal>
                )}

                {isProductModalOpen && (
                    <Modal title={t('inventory.manageProducts')} onClose={() => setIsProductModalOpen(false)}>
                        <div className="space-y-6">
                            <form onSubmit={handleAddProduct} className="p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-primary-translucent)] space-y-3">
                                <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase">{editingProduct ? t('inventory.editProduct') : t('inventory.addNewProduct')}</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <input 
                                        type="text" 
                                        placeholder={t('inventory.productNamePlaceholder')}
                                        value={newProduct.name}
                                        onChange={handleProductNameChange}
                                        className="w-full p-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-lg outline-none text-sm"
                                        required
                                    />
                                    <input 
                                        type="text" 
                                        placeholder={t('inventory.unitPlaceholder')}
                                        value={newProduct.unit}
                                        onChange={e => setNewProduct({...newProduct, unit: e.target.value})}
                                        className="w-full p-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-lg outline-none text-sm"
                                        required
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 py-2 bg-[var(--accent-primary)] text-white font-bold rounded-lg text-sm">
                                        {editingProduct ? t('inventory.update') : t('inventory.addProduct')}
                                    </button>
                                    {editingProduct && (
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setEditingProduct(null);
                                                setNewProduct({ name: '', unit: 'items' });
                                            }}
                                            className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-lg text-sm"
                                        >
                                            {t('common.cancel')}
                                        </button>
                                    )}
                                </div>
                            </form>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {products.map(product => (
                                    <div key={product.id} className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-primary-translucent)]">
                                        <div>
                                            <p className="font-bold text-sm text-[var(--text-primary)]">
                                                {product.name}
                                                {product.isTracked === false && (
                                                    <span className="ml-2 text-[8px] bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] px-1.5 py-0.5 rounded uppercase">
                                                        {t('inventory.untracked')}
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">{t('inventory.unit')}: {product.unit}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => {
                                                    HapticService.impactLight();
                                                    setEditingProduct(product);
                                                    setNewProduct({ name: product.name, unit: product.unit });
                                                }}
                                                className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    HapticService.impactMedium();
                                                    deleteProduct(product.id);
                                                    HapticService.notificationSuccess();
                                                }}
                                                className="p-2 text-[var(--text-secondary)] hover:text-[var(--negative)] transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Modal>
                )}
                {isDeleteConfirmOpen && (
                    <Modal title={t('inventory.deleteBatch')} onClose={() => setIsDeleteConfirmOpen(false)}>
                        <div className="space-y-6">
                            <p className="text-[var(--text-secondary)]">{t('inventory.confirmDeleteBatch')}</p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setIsDeleteConfirmOpen(false)}
                                    className="flex-1 py-3 bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-bold rounded-xl"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button 
                                    onClick={handleDeleteBatch}
                                    className="flex-1 py-3 bg-[var(--negative)] text-white font-bold rounded-xl"
                                >
                                    {t('common.delete')}
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
};

const Modal: React.FC<{ title: string, children: React.ReactNode, onClose: () => void }> = ({ title, children, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm"
        />
        <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="relative w-full max-w-md bg-[var(--bg-secondary)] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        >
            <div className="p-6 border-b border-[var(--border-primary-translucent)] flex items-center justify-between">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-[var(--bg-interactive-hover)] rounded-full transition-colors text-[var(--text-tertiary)]">
                    <X size={20} />
                </button>
            </div>
            <div className="p-6">
                {children}
            </div>
        </motion.div>
    </div>
);
