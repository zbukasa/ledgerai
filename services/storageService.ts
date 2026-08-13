
import { v4 as uuidv4 } from 'uuid';
import { Transaction, User, Business, Category, SubCategory, IconName } from '../types';
import { db } from './syncService';

// --- Default Data ---
export const defaultBusiness: Business = { id: 'biz-1', name: 'My Business', tier: 'free' };

export const defaultUsers: User[] = [
    { id: 'user-1', name: 'John Doe', role: 'Admin', avatarUrl: 'https://i.pravatar.cc/150?u=user-1', email: 'john@example.com', phone: '+243 81 000 0000', businessId: 'biz-1' },
    { id: 'user-2', name: 'Marie Jeanne', role: 'Manager', avatarUrl: 'https://i.pravatar.cc/150?u=user-2', email: 'marie@example.com', phone: '+243 99 000 0000', businessId: 'biz-1' },
];

export const defaultCategories: Category[] = [
    { id: 'cat-income', name: 'Income', icon: 'DollarSign' },
    { id: 'cat-materials', name: 'Materials', icon: 'HardHat' },
    { id: 'cat-fuel', name: 'Fuel', icon: 'Fuel' },
    { id: 'cat-payroll', name: 'Payroll', icon: 'Users' },
    { id: 'cat-maintenance', name: 'Maintenance', icon: 'Wrench' },
    { id: 'cat-transport', name: 'Transport', icon: 'Truck' },
    { id: 'cat-utilities', name: 'Utilities', icon: 'Zap' },
    { id: 'cat-blocks', name: 'Blocks', icon: 'Layers' },
    { id: 'cat-other', name: 'Other', icon: 'Package' },
];

export const defaultSubCategories: SubCategory[] = [
    { id: 'sub-gravel', name: 'Gravel Sale', categoryId: 'cat-income' },
    { id: 'sub-blocks-sale', name: 'Block Sale', categoryId: 'cat-blocks' },
    { id: 'sub-cement', name: 'Cement', categoryId: 'cat-materials' },
    { id: 'sub-diesel', name: 'Diesel', categoryId: 'cat-fuel' },
    { id: 'sub-wages', name: 'Wages', categoryId: 'cat-payroll' },
    { id: 'sub-repairs', name: 'Repairs', categoryId: 'cat-maintenance' },
];

export const getInitialTransactions = (userIds: string[]): Transaction[] => {
    if (userIds.length === 0) return [];
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(today.getDate() - 2);

    const transactions: Transaction[] = [
        { id: uuidv4(), date: today, type: 'expense', categoryId: 'cat-fuel', subCategoryId: 'sub-diesel', item: 'Diesel', quantity: '50L', amount: 125000, currency: 'CDF', kilometers: 154320, userId: userIds[0] },
        { id: uuidv4(), date: today, type: 'income', categoryId: 'cat-income', subCategoryId: 'sub-gravel', item: 'Gravel Sale', quantity: '1 truck', amount: 200, currency: 'USD', userId: userIds[1 % userIds.length] },
        { id: uuidv4(), date: yesterday, type: 'expense', categoryId: 'cat-materials', subCategoryId: 'sub-cement', item: 'Cement bags', quantity: '10 bags', amount: 150000, currency: 'CDF', userId: userIds[0] },
        { id: uuidv4(), date: yesterday, type: 'expense', categoryId: 'cat-payroll', subCategoryId: 'sub-wages', item: 'Daily worker wages', quantity: '5 workers', amount: 100000, currency: 'CDF', userId: userIds[1 % userIds.length] },
        { id: uuidv4(), date: twoDaysAgo, type: 'expense', categoryId: 'cat-maintenance', subCategoryId: 'sub-repairs', item: 'Truck tire repair', amount: 75, currency: 'USD', userId: userIds[0] },
    ];

    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
};

// --- Storage Keys ---
const USERS_KEY = 'users';
const BUSINESS_KEY = 'business';
const CATEGORIES_KEY = 'categories';
const SUB_CATEGORIES_KEY = 'subCategories';
const MIGRATION_KEY = 'v5_indexeddb_migration_complete';

// Async Storage Helpers using IndexedDB
export const getUsers = async (): Promise<User[] | null> => {
    const users = await db.users.toArray();
    return users.length > 0 ? users : null;
};

export const saveUsers = async (users: User[]) => {
    await db.users.clear();
    await db.users.bulkPut(users);
};

export const getBusiness = async (): Promise<Business | null> => {
    const businesses = await db.business.toArray();
    return businesses.length > 0 ? businesses[0] : null;
};

export const saveBusiness = async (business: Business) => {
    await db.business.clear();
    await db.business.put(business);
};

export const getCategories = async (): Promise<Category[] | null> => {
    const categories = await db.categories.toArray();
    return categories.length > 0 ? categories : null;
};

export const saveCategories = async (categories: Category[]) => {
    await db.categories.clear();
    await db.categories.bulkPut(categories);
};

export const getSubCategories = async (): Promise<SubCategory[] | null> => {
    const subCategories = await db.subCategories.toArray();
    return subCategories.length > 0 ? subCategories : null;
};

export const saveSubCategories = async (subCategories: SubCategory[]) => {
    await db.subCategories.clear();
    await db.subCategories.bulkPut(subCategories);
};

// --- Migration & Cleanup ---
export const runDataCleanup = async (dbInstance: any) => {
    const migrationDone = localStorage.getItem(MIGRATION_KEY);
    
    // Always clear the specific keys that cause the QuotaExceededError in localStorage
    const BAD_KEYS = ['ledger_sync_queue', 'transactions', 'users', 'categories', 'subCategories', 'business'];
    BAD_KEYS.forEach(key => {
        if (localStorage.getItem(key)) {
            console.warn(`Cleaning up legacy large-payload key from localStorage: ${key}`);
            localStorage.removeItem(key);
        }
    });

    if (migrationDone) return;

    try {
        // Migration logic for any remaining legacy data
        const legacyUsers = localStorage.getItem('users');
        if (legacyUsers) {
            await dbInstance.users.bulkPut(JSON.parse(legacyUsers));
            localStorage.removeItem('users');
        }

        const legacyBusiness = localStorage.getItem('business');
        if (legacyBusiness) {
            await dbInstance.business.put(JSON.parse(legacyBusiness));
            localStorage.removeItem('business');
        }

        const legacyCategories = localStorage.getItem('categories');
        if (legacyCategories) {
            await dbInstance.categories.bulkPut(JSON.parse(legacyCategories));
            localStorage.removeItem('categories');
        }

        const legacySubCategories = localStorage.getItem('subCategories');
        if (legacySubCategories) {
            await dbInstance.subCategories.bulkPut(JSON.parse(legacySubCategories));
            localStorage.removeItem('subCategories');
        }
        
        localStorage.setItem(MIGRATION_KEY, 'true');
    } catch (e) {
        console.error("Migration failed", e);
    }
};
