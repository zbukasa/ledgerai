
import { Transaction, SyncQueueItem, SavedRoute, RecurringTrip } from '../types';
import { generateTransactionPayload } from './hashUtils';
import { apiService } from './apiService';
import { syncService, db } from './syncService'; 
import { useState, useEffect } from 'react';
import { realtimeService } from './realtimeService';

export interface QueueItem extends SyncQueueItem {
    retryCount: number;
}

class DataService {
    private isOnline: boolean = navigator.onLine;
    private listeners: ((isOnline: boolean, queueCount: number) => void)[] = [];
    private syncInterval: any;
    private businessId: string | null = null;

    constructor() {
        window.addEventListener('online', () => this.handleConnectionChange(true));
        window.addEventListener('offline', () => this.handleConnectionChange(false));
        
        if (localStorage.getItem('ledger_sync_queue')) {
            localStorage.removeItem('ledger_sync_queue');
        }

        this.startBackgroundSync();
    }

    private handleConnectionChange(online: boolean) {
        this.isOnline = online;
        this.notifyListeners();
        if (online) {
            this.processSyncQueue();
        }
    }

    private async notifyListeners() {
        const count = await db.syncQueue.count();
        this.listeners.forEach(l => l(this.isOnline, count));
    }

    public subscribe(listener: (isOnline: boolean, queueCount: number) => void) {
        this.listeners.push(listener);
        db.syncQueue.count().then(count => {
            listener(this.isOnline, count);
        });
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    public setBusinessId(id: string | null) {
        this.businessId = id;
    }

    private broadcastChange() {
        if (this.businessId) {
            realtimeService.broadcast('transactions', {}, this.businessId);
        }
    }

    private emitActivity(type: 'transaction' | 'inventory' | 'production' | 'business', action: 'create' | 'update' | 'delete', details: string) {
        window.dispatchEvent(new CustomEvent('log-activity-request', {
            detail: { type, action, details }
        }));
    }

    private async addToQueue(type: SyncQueueItem['type'], data: any, entityId?: string) {
        const transactionId = entityId || data.id || Date.now().toString();
        
        try {
            await db.syncQueue.add({
                type,
                transactionId,
                data,
                timestamp: Date.now(),
                retryCount: 0
            });
            this.notifyListeners();
        } catch (err) {
            console.error("Critical: Failed to queue", err);
        }
    }

    private startBackgroundSync() {
        if (this.syncInterval) clearInterval(this.syncInterval);
        this.syncInterval = setInterval(() => {
            if (this.isOnline) {
                this.processSyncQueue();
            }
        }, 30000);
    }

    async findPotentialDuplicate(tx: Partial<Transaction>): Promise<Transaction | null> {
        if (!tx.amount || !tx.date) return null;

        const amount = Number(tx.amount);
        const currency = tx.currency || 'USD';
        const merchant = tx.merchant || '';
        const date = tx.date;
        
        // Calculate robust semantic payload for comparison
        const semanticPayload = generateTransactionPayload(amount, date, currency, merchant);
        
        // Match records in DB with same amount and date
        const matches = await db.transactions
            .where('date')
            .between(new Date(new Date(date).getTime() - 86400000), new Date(new Date(date).getTime() + 86400000))
            .filter(existing => {
                // 1. Exact hash match (if available)
                if (existing.hashIdempotency && (existing.hashIdempotency === semanticPayload || existing.hashIdempotency.length > 60)) {
                    // If existing has a SHA256 hash, we might need to hash our payload to compare
                    // For now, if it's a long string, assume it's a SHA256 and we'll fallback to fuzzy
                }

                const sameAmount = Math.abs(existing.amount - amount) < 0.01;
                const sameCurrency = existing.currency === currency;
                
                if (!sameAmount || !sameCurrency) return false;

                // Fuzzy merchant matching
                if (merchant && existing.merchant) {
                    const m1 = merchant.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
                    const m2 = existing.merchant.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
                    if (m1.includes(m2) || m2.includes(m1)) return true;
                }
                
                // Exact date + Exact amount is a high risk duplicate even without merchant match
                const dateStr = new Date(date).toISOString().split('T')[0];
                const sameExactDate = new Date(existing.date).toISOString().split('T')[0] === dateStr;
                return sameExactDate;
            })
            .toArray();

        return matches.length > 0 ? matches[0] : null;
    }

    async createTransaction(data: Transaction): Promise<Transaction> {
        await syncService.addTransactionToDb(data);
        this.broadcastChange();
        this.emitActivity('transaction', 'create', `Added ${data.type}: ${data.item} (${data.amount} ${data.currency})`);

        if (this.isOnline) {
            try {
                const result = await apiService.transactions.create(data);
                await syncService.addTransactionToDb({ ...data, ...result, id: data.id });
                return result;
            } catch (error) {
                await this.addToQueue('create', data);
                return data;
            }
        } else {
            await this.addToQueue('create', data);
            return data;
        }
    }

    async updateTransaction(data: Transaction): Promise<Transaction> {
        await syncService.updateTransactionInDb(data);
        this.broadcastChange();
        this.emitActivity('transaction', 'update', `Updated ${data.type}: ${data.item}`);

        if (this.isOnline) {
            try {
                const result = await apiService.transactions.update(data.id, data);
                await syncService.updateTransactionInDb(result);
                return result;
            } catch (error) {
                await this.addToQueue('update', data);
                return data;
            }
        } else {
            await this.addToQueue('update', data);
            return data;
        }
    }

    async bulkUpdateTransactions(transactions: Transaction[]): Promise<void> {
        await syncService.bulkUpdateTransactionsInDb(transactions);
        this.broadcastChange();
        this.emitActivity('transaction', 'update', `Bulk updated ${transactions.length} transactions`);

        // For simplicity in this environment, we'll queue individual updates if offline
        // or process them one by one. A real backend might have a bulk endpoint.
        for (const tx of transactions) {
            if (this.isOnline) {
                try {
                    await apiService.transactions.update(tx.id, tx);
                } catch (error) {
                    await this.addToQueue('update', tx);
                }
            } else {
                await this.addToQueue('update', tx);
            }
        }
    }

    async deleteTransaction(id: string): Promise<void> {
        await syncService.deleteTransactionFromDb(id);
        this.broadcastChange();
        this.emitActivity('transaction', 'delete', `Deleted transaction`);

        if (this.isOnline) {
            try {
                await apiService.transactions.delete(id);
            } catch (error) {
                await this.addToQueue('delete', { id });
            }
        } else {
            await this.addToQueue('delete', { id });
        }
    }

    async createProductionBatch(data: any): Promise<any> {
        // Local first
        await db.productionBatches.put(data);
        this.emitActivity('production', 'create', `Recorded production: ${data.quantityProduced} units of ${data.productType}`);

        if (this.isOnline) {
            try {
                const result = await apiService.inventory.createBatch(data);
                await db.productionBatches.put({ ...data, ...result });
                return result;
            } catch (error) {
                await this.addToQueue('create_batch', data, data.id);
                return data;
            }
        } else {
            await this.addToQueue('create_batch', data, data.id);
            return data;
        }
    }

    async updateProductionBatch(id: string, data: any): Promise<any> {
        await db.productionBatches.update(id, data);
        this.emitActivity('production', 'update', `Updated production batch`);

        if (this.isOnline) {
            try {
                return await apiService.inventory.updateBatch(id, data);
            } catch (error) {
                await this.addToQueue('update_batch', data, id);
            }
        } else {
            await this.addToQueue('update_batch', data, id);
        }
    }

    async deleteProductionBatch(id: string): Promise<void> {
        await db.productionBatches.delete(id);
        this.emitActivity('production', 'delete', `Deleted production batch`);

        if (this.isOnline) {
            try {
                await apiService.inventory.deleteBatch(id);
            } catch (error) {
                await this.addToQueue('delete_batch', { id }, id);
            }
        } else {
            await this.addToQueue('delete_batch', { id }, id);
        }
    }

    async saveProduct(data: any): Promise<any> {
        await db.products.put(data);
        this.emitActivity('inventory', 'update', `Updated product: ${data.name}`);

        if (this.isOnline) {
            try {
                return await apiService.inventory.saveProduct(data);
            } catch (error) {
                await this.addToQueue('save_product', data, data.id);
            }
        } else {
            await this.addToQueue('save_product', data, data.id);
        }
    }

    async deleteProduct(id: string): Promise<void> {
        await db.products.delete(id);
        this.emitActivity('inventory', 'delete', `Deleted product`);

        if (this.isOnline) {
            try {
                await apiService.inventory.deleteProduct(id);
            } catch (error) {
                await this.addToQueue('delete_product', { id }, id);
            }
        } else {
            await this.addToQueue('delete_product', { id }, id);
        }
    }

    async saveTrip(data: any): Promise<any> {
        await db.trips.put(data);
        this.emitActivity('transaction', 'update', `Updated trip: ${data.distance} km`);

        if (this.isOnline) {
            try {
                return await apiService.trips.save(data);
            } catch (error) {
                await this.addToQueue('save_trip', data, data.id);
            }
        } else {
            await this.addToQueue('save_trip', data, data.id);
        }
    }

    async deleteTrip(id: string): Promise<void> {
        await db.trips.delete(id);
        this.emitActivity('transaction', 'delete', `Deleted trip`);

        if (this.isOnline) {
            try {
                await apiService.trips.delete(id);
            } catch (error) {
                await this.addToQueue('delete_trip', { id }, id);
            }
        } else {
            await this.addToQueue('delete_trip', { id }, id);
        }
    }

    async saveRoute(data: SavedRoute): Promise<SavedRoute> {
        await db.savedRoutes.put(data);
        if (this.isOnline) {
            try {
                return await apiService.routes.save(data);
            } catch (error) {
                await this.addToQueue('save_route', data, data.id);
                return data;
            }
        } else {
            await this.addToQueue('save_route', data, data.id);
            return data;
        }
    }

    async deleteRoute(id: string): Promise<void> {
        await db.savedRoutes.delete(id);
        if (this.isOnline) {
            try {
                await apiService.routes.delete(id);
            } catch (error) {
                await this.addToQueue('delete_route', { id }, id);
            }
        } else {
            await this.addToQueue('delete_route', { id }, id);
        }
    }

    async saveRecurringTrip(data: RecurringTrip): Promise<RecurringTrip> {
        await db.recurringTrips.put(data);
        if (this.isOnline) {
            try {
                return await apiService.recurringTrips.save(data);
            } catch (error) {
                await this.addToQueue('save_recurring_trip', data, data.id);
                return data;
            }
        } else {
            await this.addToQueue('save_recurring_trip', data, data.id);
            return data;
        }
    }

    async updateInventoryItem(data: any): Promise<void> {
        await db.inventoryItems.put(data);
        
        if (this.isOnline) {
            try {
                await apiService.inventory.updateInventoryItem(data);
            } catch (error) {
                await this.addToQueue('update_inventory', data, data.id);
            }
        } else {
            await this.addToQueue('update_inventory', data, data.id);
        }
    }

    public async processSyncQueue() {
        const queueItems = await db.syncQueue.toArray();
        if (queueItems.length === 0) return;

        let connectionFailed = false;

        for (const item of queueItems) {
            if (connectionFailed) break;

            try {
                switch (item.type) {
                    case 'create':
                        await apiService.transactions.create(item.data as Transaction);
                        break;
                    case 'update':
                        await apiService.transactions.update(item.transactionId, item.data as Partial<Transaction>);
                        break;
                    case 'delete':
                        await apiService.transactions.delete(item.transactionId);
                        break;
                    case 'create_batch':
                        await apiService.inventory.createBatch(item.data);
                        break;
                    case 'update_batch':
                        await apiService.inventory.updateBatch(item.transactionId, item.data);
                        break;
                    case 'delete_batch':
                        await apiService.inventory.deleteBatch(item.transactionId);
                        break;
                    case 'save_product':
                        await apiService.inventory.saveProduct(item.data);
                        break;
                    case 'delete_product':
                        await apiService.inventory.deleteProduct(item.transactionId);
                        break;
                    case 'save_trip':
                        await apiService.trips.save(item.data);
                        break;
                    case 'delete_trip':
                        await apiService.trips.delete(item.transactionId);
                        break;
                    case 'save_route':
                        await apiService.routes.save(item.data);
                        break;
                    case 'delete_route':
                        await apiService.routes.delete(item.transactionId);
                        break;
                    case 'save_recurring_trip':
                        await apiService.recurringTrips.save(item.data);
                        break;
                    case 'update_inventory':
                        await apiService.inventory.updateInventoryItem(item.data);
                        break;
                }
                if (item.id) await db.syncQueue.delete(item.id);
            } catch (error: any) {
                const isNetworkError = 
                    error.message === 'Failed to fetch' || 
                    error.status === 503 || 
                    error.status === 504;

                if (isNetworkError) {
                    connectionFailed = true;
                } else {
                    if (item.id) {
                        const current = await db.syncQueue.get(item.id);
                        if (current) {
                            const retries = (current.retryCount || 0) + 1;
                            if (retries > 5) {
                                await db.syncQueue.delete(item.id);
                            } else {
                                await db.syncQueue.update(item.id, { retryCount: retries });
                            }
                        }
                    }
                }
            }
        }
        this.notifyListeners();
    }
    
    public async syncNow() {
        if(this.isOnline) await this.processSyncQueue();
    }
}

export const dataService = new DataService();

export const useOnlineStatus = () => {
    const [status, setStatus] = useState({ isOnline: navigator.onLine, queueCount: 0 });
    useEffect(() => {
        const unsubscribe = dataService.subscribe((isOnline, queueCount) => {
            setStatus({ isOnline, queueCount });
        });
        return unsubscribe;
    }, []);
    return status;
};
