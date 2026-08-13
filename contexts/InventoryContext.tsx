
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../services/syncService';
import { ProductionBatch, InventoryItem, InventoryProduct, UserRole, Transaction } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { realtimeService } from '../services/realtimeService';
import { dataService } from '../services/dataService';

import { useLanguage } from './LanguageContext';
import { useActivity } from './ActivityContext';

interface InventoryContextType {
    batches: ProductionBatch[];
    inventory: InventoryItem[];
    products: InventoryProduct[];
    addBatch: (batch: Omit<ProductionBatch, 'id' | 'userId' | 'status'>) => Promise<void>;
    updateBatch: (id: string, updates: Partial<ProductionBatch>) => Promise<void>;
    deleteBatch: (id: string) => Promise<void>;
    updateBatchStatus: (id: string, status: ProductionBatch['status'], extra?: Partial<ProductionBatch>) => Promise<void>;
    sellItems: (productType: string, quantity: number) => Promise<void>;
    setInitialStock: (productType: string, quantity: number) => Promise<void>;
    addProduct: (product: Omit<InventoryProduct, 'id' | 'businessId'>) => Promise<void>;
    updateProduct: (id: string, updates: Partial<InventoryProduct>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    adjustStockFromTransaction: (transaction: Transaction, isDelete?: boolean) => Promise<void>;
    pendingProduct: { name: string; transaction: Transaction } | null;
    resolvePendingProduct: (shouldTrack: boolean) => Promise<void>;
    isLoading: boolean;
    canModify: (role?: UserRole) => boolean;
    loadData: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [batches, setBatches] = useState<ProductionBatch[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [products, setProducts] = useState<InventoryProduct[]>([]);
    const [pendingProduct, setPendingProduct] = useState<{ name: string; transaction: Transaction } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { currentUser, activeBusinessId } = useAuth();
    const { addToast } = useNotification();
    const { t } = useLanguage();
    const { logActivity } = useActivity();

    const loadData = useCallback(async () => {
        if (!currentUser) return;
        setIsLoading(true);
        try {
            // Use activeBusinessId to separate personal and business inventory
            const bId = activeBusinessId || 'biz-1';
            
            let allBatches = await db.productionBatches.where('businessId').equals(bId).toArray();
            let allInventory = await db.inventoryItems.where('businessId').equals(bId).toArray();
            let allProducts = await db.products.where('businessId').equals(bId).toArray();

            // Migration: If no data found for this businessId, check for legacy data (no businessId)
            if (allBatches.length === 0 && allInventory.length === 0 && allProducts.length === 0) {
                const legacyBatches = await db.productionBatches.filter(b => !b.businessId).toArray();
                const legacyInventory = await db.inventoryItems.filter(i => !i.businessId).toArray();
                const legacyProducts = await db.products.filter(p => !p.businessId).toArray();

                if (legacyBatches.length > 0 || legacyInventory.length > 0 || legacyProducts.length > 0) {
                    console.log('Migrating legacy inventory data to businessId:', bId);
                    for (const b of legacyBatches) await db.productionBatches.update(b.id, { businessId: bId });
                    for (const i of legacyInventory) await db.inventoryItems.update(i.id, { businessId: bId });
                    for (const p of legacyProducts) await db.products.update(p.id, { businessId: bId });
                    
                    // Re-fetch after migration
                    allBatches = await db.productionBatches.where('businessId').equals(bId).toArray();
                    allInventory = await db.inventoryItems.where('businessId').equals(bId).toArray();
                    allProducts = await db.products.where('businessId').equals(bId).toArray();
                }
            }
            
            // Ensure default products exist - ONLY if the products list is empty
            if (allProducts.length === 0) {
                const defaultProductNames = ['23cm Block', '14cm Demi-block', 'Cement', 'Sand', 'Gravel', 'Fuel', 'Soap'];
                const units: {[key: string]: string} = {
                    '23cm Block': 'blocks',
                    '14cm Demi-block': 'blocks',
                    'Cement': 'bags',
                    'Sand': 'm3',
                    'Gravel': 'm3',
                    'Fuel': 'liters',
                    'Soap': 'bars'
                };
                
                for (const name of defaultProductNames) {
                    const newProd: InventoryProduct = { 
                        id: uuidv4(), 
                        name, 
                        unit: units[name] || 'units', 
                        businessId: bId,
                        isTracked: true
                    };
                    await db.products.add(newProd);
                    allProducts.push(newProd);
                }
            }
            
            // Ensure dates are Date objects
            const processedBatches = allBatches.map(batch => ({
                ...batch,
                date: batch.date instanceof Date ? batch.date : (batch.date ? new Date(batch.date) : new Date()),
                curingStartDate: batch.curingStartDate ? (batch.curingStartDate instanceof Date ? batch.curingStartDate : new Date(batch.curingStartDate)) : undefined,
                mpaTestDate: batch.mpaTestDate ? (batch.mpaTestDate instanceof Date ? batch.mpaTestDate : new Date(batch.mpaTestDate)) : undefined,
                strengthTests: batch.strengthTests?.map(test => ({
                    ...test,
                    date: test.date instanceof Date ? test.date : (test.date ? new Date(test.date) : new Date())
                }))
            }));

            const processedInventory = allInventory.map(item => ({
                ...item,
                lastUpdated: item.lastUpdated instanceof Date ? item.lastUpdated : (item.lastUpdated ? new Date(item.lastUpdated) : new Date())
            }));

            // Auto-update curing status
            const now = new Date();
            for (const batch of processedBatches) {
                if ((batch.status === 'curing' || batch.status === 'ready' || batch.status === 'tested') && batch.curingStartDate) {
                    const startDate = new Date(batch.curingStartDate);
                    const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays >= 28) {
                        await db.productionBatches.update(batch.id, { status: 'completed' });
                        batch.status = 'completed';
                    }
                }
            }
            
            setBatches(processedBatches.sort((a, b) => b.date.getTime() - a.date.getTime()));
            setInventory(processedInventory);
            setProducts(allProducts);
        } catch (error) {
            console.error('Error loading inventory data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        loadData();

        // Cleanup legacy non-product items from products database
        const cleanupProducts = async () => {
            if (!db) return;
            const allProds = await db.products.toArray();
            const toDelete = allProds.filter(p => 
                p.name.startsWith('Trip:') || 
                p.name.includes('km logs') ||
                p.name.toLowerCase().includes('phone bill')
            );
            if (toDelete.length > 0) {
                console.log(`Cleaning up ${toDelete.length} legacy non-product items from inventory`);
                for (const p of toDelete) {
                    await db.products.delete(p.id);
                }
                loadData();
            }
        };
        cleanupProducts();
    }, [loadData]);

    useEffect(() => {
        if (currentUser?.businessId) {
            realtimeService.connect(currentUser.businessId);
        }
        
        const handleSync = (e: any) => {
            const { type } = e.detail;
            if (type === 'inventory' || type === 'production' || type === 'products') {
                loadData();
            }
        };

        window.addEventListener('realtime-sync', handleSync);
        return () => {
            window.removeEventListener('realtime-sync', handleSync);
        };
    }, [currentUser, loadData]);

    const canModify = (role?: UserRole) => {
        return role === 'Admin' || role === 'Manager';
    };

    const broadcastChange = (type: string) => {
        if (currentUser?.businessId) {
            realtimeService.broadcast(type, {}, currentUser.businessId);
        }
    };

    const addBatch = async (batchData: Omit<ProductionBatch, 'id' | 'userId' | 'status'>) => {
        if (!currentUser) return;
        
        const bId = activeBusinessId || 'biz-1';
        const id = uuidv4();
        const trimmedProductType = batchData.productType.trim();
        const newBatch: ProductionBatch = {
            ...batchData,
            productType: trimmedProductType,
            id,
            userId: currentUser.id,
            status: 'curing' as const,
            businessId: bId,
            curingStartDate: batchData.curingStartDate || new Date()
        };

        try {
            await dataService.createProductionBatch(newBatch);

            // Update inventory - Query DB directly to avoid stale state
            const allInv = await db.inventoryItems.where('businessId').equals(bId).toArray();
            const existing = allInv.find(i => i.productType.toLowerCase() === trimmedProductType.toLowerCase());
            
            if (existing) {
                await db.inventoryItems.update(existing.id, {
                    totalQuantity: existing.totalQuantity + batchData.quantityProduced,
                    lastUpdated: new Date(),
                    productType: trimmedProductType // Ensure name matches the product exactly
                });
            } else {
                await db.inventoryItems.add({
                    id: uuidv4(),
                    productType: trimmedProductType,
                    totalQuantity: batchData.quantityProduced,
                    lastUpdated: new Date(),
                    businessId: bId
                });
            }

            // Decrement cement stock if used
            const cementBagsUsed = batchData.cementBagsUsed ?? 0;
            if (cementBagsUsed > 0) {
                // Try to find cement item case-insensitively
                const allInv = await db.inventoryItems.where('businessId').equals(bId).toArray();
                const cement = allInv.find(i => i.productType.toLowerCase() === 'cement' || i.productType.toLowerCase().includes('cement'));

                if (cement) {
                    await db.inventoryItems.update(cement.id, {
                        totalQuantity: Math.max(0, cement.totalQuantity - cementBagsUsed),
                        lastUpdated: new Date()
                    });
                    addToast(t('notifications.autoUpdatedCement', { count: cementBagsUsed }), 'info');
                }
            }

            addToast(t('inventory.productionRecorded'), 'success');
            logActivity({ type: 'production', action: 'create', details: `Recorded production: ${batchData.quantityProduced} units of ${batchData.productType}` });
            broadcastChange('production');
            loadData();
        } catch (error) {
            console.error('Error adding batch:', error);
            addToast(t('common.unknownError'), 'error');
        }
    };

    const updateBatch = async (id: string, updates: Partial<ProductionBatch>) => {
        try {
            const oldBatch = await db.productionBatches.get(id);
            await dataService.updateProductionBatch(id, updates);
            
            // If quantity changed, update inventory
            if (updates.quantityProduced !== undefined && oldBatch) {
                const diff = updates.quantityProduced - oldBatch.quantityProduced;
                const productType = updates.productType || oldBatch.productType;
                const bId = activeBusinessId || 'biz-1';
                const allInv = await db.inventoryItems.where('businessId').equals(bId).toArray();
                const existing = allInv.find(i => i.productType.toLowerCase() === productType.toLowerCase());
                
                if (existing) {
                    await db.inventoryItems.update(existing.id, {
                        totalQuantity: Math.max(0, existing.totalQuantity + diff),
                        lastUpdated: new Date()
                    });
                }
            }

            addToast(t('inventory.stockUpdated'), 'success');
            logActivity({ type: 'production', action: 'update', details: `Updated production batch for ${oldBatch?.productType || 'unknown'}` });
            loadData();
        } catch (error) {
            console.error('Error updating batch:', error);
            addToast(t('common.unknownError'), 'error');
        }
    };

    const deleteBatch = async (id: string) => {
        if (!canModify(currentUser?.role)) {
            addToast(t('notifications.unauthorized'), 'error');
            return;
        }
        try {
            const batch = await db.productionBatches.get(id);
            if (batch) {
                // Deduct from inventory
                const bId = activeBusinessId || 'biz-1';
                const allInv = await db.inventoryItems.where('businessId').equals(bId).toArray();
                const existing = allInv.find(i => i.productType.toLowerCase() === batch.productType.toLowerCase());
                if (existing) {
                    await db.inventoryItems.update(existing.id, {
                        totalQuantity: Math.max(0, existing.totalQuantity - batch.quantityProduced),
                        lastUpdated: new Date()
                    });
                }
                await dataService.deleteProductionBatch(id);
                addToast(t('inventory.batchDeleted'), 'success');
                logActivity({ type: 'production', action: 'delete', details: `Deleted production batch for ${batch.productType}` });
                broadcastChange('production');
                loadData();
            }
        } catch (error) {
            console.error('Error deleting batch:', error);
            addToast(t('common.unknownError'), 'error');
        }
    };

    const updateBatchStatus = async (id: string, status: ProductionBatch['status'], extra?: Partial<ProductionBatch>) => {
        try {
            await dataService.updateProductionBatch(id, {
                status,
                ...extra
            });
            
            addToast(t('inventory.stockUpdated'), 'success');
            logActivity({ type: 'production', action: 'update', details: `Updated status to ${status} for production batch` });
            loadData();
        } catch (error) {
            console.error('Error updating batch status:', error);
            addToast(t('common.unknownError'), 'error');
        }
    };

    const sellItems = async (productType: string, quantity: number) => {
        try {
            const bId = activeBusinessId || 'biz-1';
            const allInv = await db.inventoryItems.where('businessId').equals(bId).toArray();
            const existing = allInv.find(i => i.productType.toLowerCase() === productType.toLowerCase());
            if (!existing || existing.totalQuantity < quantity) {
                addToast(t('inventory.insufficientStock'), 'error');
                return;
            }

            await db.inventoryItems.update(existing.id, {
                totalQuantity: existing.totalQuantity - quantity,
                lastUpdated: new Date()
            });
            addToast(t('notifications.inventoryUpdatedSale', { count: quantity, product: productType }), 'info');
            logActivity({ type: 'inventory', action: 'update', details: `Sold ${quantity} units of ${productType}` });
            broadcastChange('inventory');
            loadData();
        } catch (error) {
            console.error('Error selling items:', error);
            addToast(t('common.unknownError'), 'error');
        }
    };

    const setInitialStock = async (productType: string, quantity: number) => {
        if (!currentUser) return;
        const bId = activeBusinessId || 'biz-1';
        const trimmedProductType = productType.trim();
        
        try {
            const allInv = await db.inventoryItems.where('businessId').equals(bId).toArray();
            const existing = allInv.find(i => i.productType.toLowerCase() === trimmedProductType.toLowerCase());
            if (existing) {
                await db.inventoryItems.update(existing.id, {
                    totalQuantity: quantity,
                    lastUpdated: new Date(),
                    productType: trimmedProductType // Ensure name matches the product exactly
                });
            } else {
                await db.inventoryItems.add({
                    id: uuidv4(),
                    productType: trimmedProductType,
                    totalQuantity: quantity,
                    lastUpdated: new Date(),
                    businessId: bId
                });
            }
            addToast(t('inventory.stockUpdated'), 'success');
            loadData();
        } catch (error) {
            console.error('Error setting initial stock:', error);
            addToast(t('common.unknownError'), 'error');
        }
    };

    const addProduct = async (productData: Omit<InventoryProduct, 'id' | 'businessId'>) => {
        if (!currentUser) return;
        const bId = activeBusinessId || 'biz-1';
        const newProduct: InventoryProduct = {
            ...productData,
            id: uuidv4(),
            businessId: bId
        };
        try {
            await dataService.saveProduct(newProduct);
            addToast(t('notifications.categoryAdded'), 'success');
            broadcastChange('products');
            loadData();
        } catch (error) {
            console.error('Error adding product:', error);
            addToast(t('common.unknownError'), 'error');
        }
    };

    const updateProduct = async (id: string, updates: Partial<InventoryProduct>) => {
        try {
            const product = products.find(p => p.id === id);
            if (product) {
                await dataService.saveProduct({ ...product, ...updates });
            }
            addToast(t('notifications.categoryUpdated'), 'success');
            broadcastChange('products');
            loadData();
        } catch (error) {
            console.error('Error updating product:', error);
            addToast(t('common.unknownError'), 'error');
        }
    };

    const deleteProduct = async (id: string) => {
        if (!canModify(currentUser?.role)) {
            addToast(t('notifications.unauthorized'), 'error');
            return;
        }
        try {
            const product = products.find(p => p.id === id);
            if (product) {
                // Also delete associated inventory item
                const invItem = inventory.find(i => i.productType === product.name);
                if (invItem) {
                    await db.inventoryItems.delete(invItem.id);
                }
            }
            
            await dataService.deleteProduct(id);
            addToast(t('notifications.categoryDeleted'), 'success');
            broadcastChange('products');
            broadcastChange('inventory');
            loadData();
        } catch (error) {
            console.error('Error deleting product:', error);
            addToast(t('common.unknownError'), 'error');
        }
    };

    const adjustStockFromTransaction = async (transaction: Transaction, isDelete: boolean = false) => {
        if (!currentUser) return;

        // CRITICAL: Ignore transactions related to vehicle trips or recurring trips
        // These should NEVER be tracked as inventory products
        if (transaction.usageType === 'business' || transaction.usageType === 'personal') {
            return;
        }

        // Also check item name for "Trip:" prefix which is used for vehicle logs
        if (transaction.item.startsWith('Trip:') || transaction.item.includes('km logs')) {
            return;
        }

        const bId = activeBusinessId || 'biz-1';
        const itemName = transaction.item.trim().toLowerCase();
        let productType = '';
        let quantity = parseFloat(transaction.quantity || '1') || 1;

        // 1. Try mapping logic first
        if (itemName.includes('cement')) productType = 'Cement';
        else if (itemName.includes('sand')) productType = 'Sand';
        else if (itemName.includes('gravel')) productType = 'Gravel';
        else if (itemName.includes('fuel') || itemName.includes('diesel') || itemName.includes('petrol')) productType = 'Fuel';
        else if (itemName.includes('soap')) productType = 'Soap';
        else if (itemName.includes('block')) {
            if (itemName.includes('14') || itemName.includes('demi')) productType = '14cm Demi-block';
            else productType = '23cm Block';
        }

        // 2. If no mapping, check database for exact match (case insensitive)
        const allProducts = await db.products.where('businessId').equals(bId).toArray();
        
        if (!productType) {
            const matchedProduct = allProducts.find(p => p.name.toLowerCase() === itemName || itemName.includes(p.name.toLowerCase()));
            if (matchedProduct) {
                // If the product exists but is marked as not tracked, skip
                if (matchedProduct.isTracked === false) return;
                productType = matchedProduct.name;
            }
        } else {
            // Even if we have a mapping, check if the user has a product with a slightly different name
            // but the same "intent" (e.g. "14cm Demi Block" vs "14cm Demi-block")
            // Also check if they have "Cement Bags" when we mapped to "Cement"
            const matchedProduct = allProducts.find(p => 
                p.name.toLowerCase() === productType.toLowerCase() || 
                p.name.toLowerCase().includes(productType.toLowerCase()) ||
                productType.toLowerCase().includes(p.name.toLowerCase())
            );
            if (matchedProduct) {
                productType = matchedProduct.name; // Use the user's actual product name
            }
        }

        // 3. If still no productType and it's an expense, we might want to track it
        if (!productType && transaction.type === 'expense' && !isDelete) {
            // ONLY prompt for new products if the category is related to materials, fuel, or blocks
            // This prevents random expenses like phone bills from triggering inventory prompts
            const inventoryCategories = ['cat-materials', 'cat-fuel', 'cat-blocks'];
            const isInventoryRelated = inventoryCategories.includes(transaction.categoryId || '');
            
            if (!isInventoryRelated) {
                return;
            }

            const potentialName = transaction.item.charAt(0).toUpperCase() + transaction.item.slice(1);
            try {
                const exists = await db.products.where('name').equalsIgnoreCase(potentialName).first();
                if (!exists) {
                    // Instead of window.confirm, set pending state
                    setPendingProduct({ name: potentialName, transaction });
                    return; // Stop here, wait for resolution
                } else {
                    if (exists.isTracked === false) return;
                    productType = exists.name;
                }
            } catch (e) {
                console.error('Error checking for existing product:', e);
            }
        }

        if (!productType) return;

        let direction = transaction.type === 'expense' ? 1 : -1;
        if (isDelete) direction *= -1;

        const change = quantity * direction;

        try {
            // Query DB directly for existing inventory item to avoid stale state
            const allInv = await db.inventoryItems.where('businessId').equals(bId).toArray();
            const existing = allInv.find(i => i.productType.toLowerCase() === productType.toLowerCase());
            
            if (existing) {
                await dataService.updateInventoryItem({
                    ...existing,
                    totalQuantity: Math.max(0, existing.totalQuantity + change),
                    lastUpdated: new Date()
                });
            } else if (change > 0) {
                await dataService.updateInventoryItem({
                    id: uuidv4(),
                    productType,
                    totalQuantity: change,
                    lastUpdated: new Date(),
                    businessId: bId
                });
                addToast(t('notifications.newInventoryItem', { product: productType }), 'success');
            }
            
            logActivity({ 
                type: 'inventory', 
                action: 'update', 
                details: `${isDelete ? 'Reversed' : 'Auto-updated'} stock for ${productType}: ${change > 0 ? '+' : ''}${change} units` 
            });

            addToast(t('notifications.stockAdjustment', { 
                action: isDelete ? t('common.reversed') || 'Reversed' : t('common.autoUpdated') || 'Auto-updated', 
                product: productType, 
                change: `${change > 0 ? '+' : ''}${change}` 
            }), 'info');
            
            broadcastChange('inventory');
            await loadData(); // Ensure state is refreshed
        } catch (error) {
            console.error('Error adjusting stock from transaction:', error);
        }
    };

    const resolvePendingProduct = async (shouldTrack: boolean) => {
        if (!pendingProduct || !currentUser) return;
        
        const { name, transaction } = pendingProduct;
        const bId = activeBusinessId || 'biz-1';
        
        try {
            await db.products.add({
                id: uuidv4(),
                name,
                unit: 'units',
                businessId: bId,
                isTracked: shouldTrack
            });

            setPendingProduct(null);

            if (shouldTrack) {
                addToast(t('notifications.newProductCategory', { name }), 'info');
                // Now actually adjust the stock since we have a tracked product
                await adjustStockFromTransaction(transaction);
            }
        } catch (error) {
            console.error('Error resolving pending product:', error);
            addToast(t('common.unknownError'), 'error');
            setPendingProduct(null);
        }
    };

    return (
        <InventoryContext.Provider value={{ 
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
            adjustStockFromTransaction,
            pendingProduct,
            resolvePendingProduct,
            isLoading,
            canModify,
            loadData
        }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (context === undefined) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
};
