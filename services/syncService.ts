
import { Dexie, Table } from 'dexie';
import { Transaction, SyncQueueItem, User, Business, Category, SubCategory, AIProposal, ProductionBatch, InventoryItem, InventoryProduct, Activity, Trip, SavedRoute, RecurringTrip, AIInsightCache } from '../types';
import { runDataCleanup } from './storageService';

// --- Database Definition ---

// Use named Dexie import to ensure TypeScript correctly recognizes inherited members like version() and on()
class LedgerDatabase extends Dexie {
    transactions!: Table<Transaction>;
    syncQueue!: Table<SyncQueueItem>;
    users!: Table<User>;
    business!: Table<Business>;
    categories!: Table<Category>;
    subCategories!: Table<SubCategory>;
    aiProposals!: Table<AIProposal>;
    productionBatches!: Table<ProductionBatch>;
    inventoryItems!: Table<InventoryItem>;
    products!: Table<InventoryProduct>;
    trips!: Table<Trip>;
    activities!: Table<Activity>;
    savedRoutes!: Table<SavedRoute>;
    recurringTrips!: Table<RecurringTrip>;
    aiInsights!: Table<AIInsightCache>;

    constructor() {
        super('LedgerDatabase');
        
        (this as any).version(16).stores({
            transactions: 'id, date, type, categoryId, userId, businessId, isArchived',
            syncQueue: '++id, type, transactionId, timestamp',
            users: 'id',
            business: 'id',
            categories: 'id',
            subCategories: 'id, categoryId',
            aiProposals: 'id, status, appliedAt',
            productionBatches: 'id, batchId, date, productType, status, businessId',
            inventoryItems: 'id, productType, businessId',
            products: 'id, name, businessId',
            trips: 'id, startTime, userId, businessId',
            activities: 'id, timestamp, userId, businessId',
            savedRoutes: 'id, userId',
            recurringTrips: 'id, userId, routeId',
            aiInsights: 'id, fingerprint'
        });
        
        (this as any).on('ready', () => runDataCleanup(this));
    }
}

export const db = new LedgerDatabase();

class LocalDbService {
    async getAllTransactions(): Promise<Transaction[]> {
        return db.transactions.orderBy('date').reverse().toArray();
    }

    async getNonArchivedTransactions(): Promise<Transaction[]> {
        return db.transactions.orderBy('date').reverse().filter(tx => !tx.isArchived).toArray();
    }

    async addTransactionToDb(transaction: Transaction): Promise<void> {
        await db.transactions.put(transaction);
    }

    async updateTransactionInDb(transaction: Transaction): Promise<void> {
        await db.transactions.put(transaction);
    }

    async bulkUpdateTransactionsInDb(transactions: Transaction[]): Promise<void> {
        await db.transactions.bulkPut(transactions);
    }

    async deleteTransactionFromDb(id: string): Promise<void> {
        await db.transactions.delete(id);
    }
    
    // Legacy aliases
    async addTransaction(transaction: Transaction) { return this.addTransactionToDb(transaction); }
    async updateTransaction(transaction: Transaction) { return this.updateTransactionInDb(transaction); }
    async deleteTransaction(id: string) { return this.deleteTransactionFromDb(id); }
}

export const syncService = new LocalDbService();
