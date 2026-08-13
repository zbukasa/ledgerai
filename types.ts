
// Fix: Re-export IconName to make it available for other modules importing from types.ts.
import type { IconName } from "./utils/helpers";

export type { IconName };

export type TransactionType = 'income' | 'expense';

export type Currency = 'USD' | 'CDF' | 'CAD' | 'NGN' | 'KES' | 'GHS' | 'ZAR' | 'XOF' | 'XAF' | 'TZS' | 'UGX' | 'RWF' | 'ETB' | 'EGP' | 'MAD' | 'INR' | 'BRL' | 'MXN' | 'IDR' | 'EUR' | 'GBP' | 'ARS' | 'COP' | 'PEN' | 'CLP' | 'UYU' | 'BOB' | 'PYG' | 'GTQ' | 'CRC' | 'DOP' | 'AOA' | 'MZN' | 'CVE' | 'DZD' | 'TND' | 'AUD' | 'NZD' | 'SGD' | 'PHP' | 'PKR' | 'CHF' | 'JMD' | 'TTD' | 'GYD' | 'BZD' | 'HTG' | 'MOP' | 'hi' | 'ar';

export type UserRole = 'Admin' | 'Manager' | 'Member';

export type SubscriptionTier = 'free' | 'premium' | 'enterprise';

export type DistanceUnit = 'km' | 'miles';

export type Feature = 
    | 'VOICE_UNLIMITED' 
    | 'INSIGHTS_UNLIMITED' 
    | 'OCR_UNLIMITED' 
    | 'BANK_SYNC' 
    | 'CLOUD_BACKUP' 
    | 'MULTI_USER' 
    | 'RBAC' 
    | 'INVENTORY' 
    | 'BATCH_MANAGEMENT' 
    | 'AUDIT_LOGS' 
    | 'ADVANCED_EXPORT'
    | 'NO_ADS'
    | 'TRIP_TRACKER'
    | 'AI_INSIGHTS'
    | 'RECURRING_TRIPS'
    | 'VEHICLE_TRACKING';

export interface UsageStats {
    voiceCommands: number;
    aiInsights: number;
    receiptScans: number;
    lastResetMonth: string; // YYYY-MM
}

export interface User {
    id: string;
    name: string;
    role: UserRole;
    avatarUrl: string;
    email?: string;
    phone?: string;
    businessId?: string; // Link to organization/household
    tier?: SubscriptionTier;
    usage?: UsageStats;
    trialStartedAt?: string; // ISO date string
    hasUsedTrial?: boolean; // Explicit flag to prevent multiple trials
    distanceUnit?: DistanceUnit;
    hasAcceptedTerms?: boolean;
    // Promo system fields
    promoIsActive?: boolean;
    promoCode?: string;
    promoActivatedAt?: string;
    promoExpiresAt?: string;
    originalPromoCode?: string;
    convertedFromPromo?: boolean;
    features?: string[] | string; // Can be array or JSON string
    createdAt?: string;
}

export interface PromoCode {
    code: string;
    trialDurationDays: number;
    maxRedemptions?: number;
    currentRedemptions: number;
    isActive: boolean;
    expiresAt?: string;
    createdAt: string;
}

export interface PromoRedemption {
    id: string;
    userId: string;
    promoCode: string;
    redeemedAt: string;
    expiresAt: string;
    convertedToPaid?: boolean;
    convertedAt?: string;
}

export interface Business {
    id: string;
    name: string;
    businessType?: string;
    description?: string;
    inviteCode?: string; // For seamless linking
    adminId?: string; // The user who owns/manages the business
    tier?: SubscriptionTier;
    settings?: {
        restrictIncomeVisibility?: boolean; // If true, non-admins only see income they created
        distanceUnit?: DistanceUnit;
    };
}

export interface Category {
    id: string;
    name: string;
    icon: IconName;
}

export interface SubCategory {
    id: string;
    name: string;
    categoryId: string;
}

export interface LineItem {
    id: string;
    item: string;
    amount: number;
    category?: string;
    quantity?: string;
}

export type UsageType = 'business' | 'personal' | 'none';

export interface Transaction {
    id:string;
    date: Date;
    type: TransactionType;
    amount: number;
    currency: Currency;
    item: string;
    quantity?: string;
    merchant?: string;
    categoryId: string;
    subCategoryId?: string;
    kilometers?: number;
    usageType?: UsageType;
    userId: string;
    businessId?: string; // Link to organization/household
    source?: 'manual' | 'bank' | 'document';
    receiptImages?: string[]; // Array of base64 encoded image strings
    lineItems?: LineItem[]; // Optional list of itemized entries from a receipt
    hashIdempotency?: string; // For cross-source deduplication
    isArchived?: boolean;
}

export interface AIProposal {
    id: string;
    type: 'reclassify' | 'create_category' | 'budget_alert' | 'optimization';
    title: string;
    description: string;
    impact: string;
    proposedValue?: any;
    proposedType?: TransactionType;
    affectedTransactionIds?: string[];
    status?: 'pending' | 'applied' | 'dismissed';
    appliedAt?: number;
}

export interface ParsedTransaction {
    id: string;
    transactionType: TransactionType;
    amount: number;
    currency: Currency;
    item: string;
    date?: string; // ISO date string extracted from receipt
    quantity?: string;
    merchant?: string;
    category: string; 
    subCategory?: string;
    kilometers?: number;
    usageType?: UsageType;
    receiptGroupId?: string;
    hashIdempotency?: string;
}

export interface SavedRoute {
    id: string;
    name: string;
    from: string;
    to: string;
    distance: number; // in kilometers
    userId: string;
}

export interface RecurringTrip {
    id: string;
    routeId: string;
    dates: string[]; // ISO date strings
    usageType: UsageType;
    userId: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

export type FilterState = {
    type?: 'all' | TransactionType;
    categoryId?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    showArchived?: boolean;
};

export interface ImageInput {
    id: string;
    base64: string;
    mimeType: string;
    previewUrl: string;
}

export interface Trip {
    id: string;
    startTime: number;
    endTime?: number;
    startLocation?: { lat: number; lng: number };
    currentLocation?: { lat: number; lng: number };
    endLocation?: { lat: number; lng: number };
    distance: number; // in kilometers
    isActive: boolean;
    usageType: UsageType;
    userId: string;
    businessId?: string;
    routeName?: string;
    multiplier?: number;
}

export type VoiceCommand = 
    | { type: 'create', data: Omit<Transaction, 'id' | 'userId'> } 
    | { type: 'edit', data: { target: 'last', updates?: Partial<Omit<Transaction, 'id' | 'userId'>> } } 
    | { type: 'filter', data: { transactionType?: TransactionType, categoryName?: string, dateRange?: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month', calculateTotal?: boolean } }
    | { type: 'trip', data: { action: 'start' | 'stop' } }
    | { type: 'currency', data: { currency: Currency } }
    | { type: 'language', data: { language: 'en' | 'fr' | 'ln' | 'sw' | 'es' | 'pt' | 'hi' | 'ar' } }
    | { type: 'production', data: { productType: string, quantity: number, cementBags?: number } }
    | { type: 'sale', data: { productType: string, quantity: number, price?: number, currency?: Currency } }
    | { type: 'usage', data: { productType: string, quantity: number } }
    | { type: 'stock_adjust', data: { productType: string, quantity: number } };

export interface InventoryProduct {
    id: string;
    name: string;
    unit: string; // e.g., 'blocks', 'hours', 'items'
    description?: string;
    businessId?: string;
    isTracked?: boolean;
}

export interface StrengthTest {
    id: string;
    date: Date;
    result: number;
    daysSinceCuring: number;
}

export interface ProductionBatch {
    id: string;
    batchId: string;
    date: Date;
    productType: string;
    quantityProduced: number;
    cementBagsUsed?: number; // Optional, specific to block making but kept for compatibility
    curingStartDate?: Date;
    mpaTestResult?: number; // Kept for backward compatibility
    mpaTestDate?: Date; // Kept for backward compatibility
    strengthTests?: StrengthTest[];
    status: 'curing' | 'ready' | 'tested' | 'completed';
    userId: string;
    businessId?: string;
}

export interface InventoryItem {
    id: string;
    productType: string;
    totalQuantity: number;
    lastUpdated: Date;
    businessId?: string;
}

export interface Activity {
    id: string;
    userId: string;
    userName: string;
    type: 'transaction' | 'inventory' | 'production' | 'business';
    action: 'create' | 'update' | 'delete';
    details: string;
    timestamp: number;
    businessId?: string;
}

export interface SyncQueueItem {
    id?: number; // Auto-incremented by Dexie
    type: 'create' | 'update' | 'delete' | 'create_batch' | 'update_batch' | 'delete_batch' | 'save_product' | 'delete_product' | 'save_trip' | 'delete_trip' | 'update_inventory' | 'save_route' | 'delete_route' | 'save_recurring_trip';
    transactionId: string;
    data?: any; // Payload for create/update
    timestamp: number;
    retryCount?: number;
}

// --- Bank Connectivity Layer Models ---

export interface BankConnection {
    id: string;
    userId: string;
    providerName: string;
    status: 'active' | 'error' | 'disconnected';
    accessTokenEncrypted: string;
    refreshTokenEncrypted?: string;
    institutionId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface BankAccount {
    id: string;
    connectionId: string;
    accountIdProvider: string;
    name: string;
    type: string;
    currency: string;
    maskLast4: string;
}

export interface BankTransaction {
    id: string;
    accountId: string;
    providerTxnId: string;
    postedAt: Date;
    amount: number;
    currency: string;
    merchantName?: string;
    description: string;
    categoryRaw?: string;
    ledgerCategory?: string;
    pending: boolean;
    hashIdempotency: string;
    createdAt: Date;
    needsReview?: boolean;
}

export interface BankSyncState {
    connectionId: string;
    cursor?: string;
    lastSyncedAt: Date;
}

export interface QuickAddAction {
    id: string;
    labelKey: string; // Translation key
    icon: string; // Icon name from lucide-react
    actionType: 'fuel' | 'payroll' | 'materials' | 'income' | 'scan' | 'trip' | 'voice' | 'production';
    isIncome?: boolean;
}

export interface AIInsightCache {
    id: string;
    fingerprint: string;
    narrative: string;
    proposals: AIProposal[];
    timestamp: number;
}
