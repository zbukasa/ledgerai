import { pgTable, text, timestamp, boolean, doublePrecision, unique, varchar, integer } from 'drizzle-orm/pg-core';

// --- Ledger Core Tables ---

export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  date: timestamp('date').notNull(),
  type: text('type').notNull(), // 'income' | 'expense'
  amount: text('amount').notNull(), // Stored as string for precision
  currency: text('currency').notNull(),
  item: text('item').notNull(),
  quantity: text('quantity'),
  merchant: text('merchant'),
  categoryId: text('category_id').notNull(),
  subCategoryId: text('sub_category_id'),
  kilometers: doublePrecision('kilometers'),
  usageType: text('usage_type'), // 'business' | 'personal' | 'none'
  userId: text('user_id').notNull(),
  source: text('source').default('manual'), // 'manual' | 'bank' | 'document'
  sourceRef: text('source_ref').unique(), // e.g., 'mock:txn_123'
  hashIdempotency: text('hash_idempotency'), // For cross-source deduplication (scoped per user)
  isArchived: boolean('is_archived').default(false),
  createdAt: timestamp('created_at').notNull(),
}, (table) => ({
  // Dedup must be scoped per user — a global unique on the hash would collide across
  // tenants (same amount/date/merchant) and drop legitimate transactions.
  hashUnique: unique().on(table.userId, table.hashIdempotency),
}));

// --- Bank Connectivity Layer Tables ---

export const bankConnections = pgTable('bank_connections', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  providerName: text('provider_name').notNull(),
  status: text('status').notNull(), // 'active' | 'error' | 'disconnected'
  accessTokenEncrypted: text('access_token_encrypted').notNull(),
  refreshTokenEncrypted: text('refresh_token_encrypted'),
  institutionId: text('institution_id').notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const bankAccounts = pgTable('bank_accounts', {
  id: text('id').primaryKey(),
  connectionId: text('connection_id').notNull().references(() => bankConnections.id),
  accountIdProvider: text('account_id_provider').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  currency: text('currency').notNull(),
  maskLast4: text('mask_last4').notNull(),
}, (table) => ({
  unq: unique().on(table.connectionId, table.accountIdProvider),
}));

export const bankTransactions = pgTable('bank_transactions', {
  id: text('id').primaryKey(),
  connectionId: text('connection_id').references(() => bankConnections.id), // owning connection (for ownership scoping)
  accountId: text('account_id').notNull(), // accountIdProvider or internal ID
  providerTxnId: text('provider_txn_id').notNull(),
  postedAt: timestamp('posted_at').notNull(),
  amount: text('amount').notNull(), // Stored as string for precision
  currency: text('currency').notNull(),
  merchantName: text('merchant_name'),
  description: text('description').notNull(),
  categoryRaw: text('category_raw'),
  ledgerCategory: text('ledger_category'),
  confidence: doublePrecision('confidence'),
  pending: boolean('pending').notNull(),
  hashIdempotency: text('hash_idempotency').notNull(),
  needsReview: boolean('needs_review').default(false),
  createdAt: timestamp('created_at').notNull(),
  ingestedAt: timestamp('ingested_at'),
}, (table) => ({
  providerTxnUnique: unique().on(table.accountId, table.providerTxnId),
  // Scope dedup per account so identical amounts/dates across different accounts/users don't collide.
  hashUnique: unique().on(table.accountId, table.hashIdempotency),
}));

export const bankSyncState = pgTable('bank_sync_state', {
  connectionId: text('connection_id').primaryKey().references(() => bankConnections.id),
  cursor: text('cursor'),
  lastSyncedAt: timestamp('last_synced_at').notNull(),
});

export const brickBatches = pgTable('brick_batches', {
  id: text('id').primaryKey(),
  batchId: text('batch_id').notNull(),
  date: timestamp('date').notNull(),
  brickType: text('brick_type').notNull(),
  quantityProduced: integer('quantity_produced').notNull(),
  cementBagsUsed: doublePrecision('cement_bags_used').notNull(),
  curingStartDate: timestamp('curing_start_date').notNull(),
  mpaTestResult: doublePrecision('mpa_test_result'),
  mpaTestDate: timestamp('mpa_test_date'),
  status: text('status').notNull(), // 'curing' | 'ready' | 'tested'
  userId: text('user_id').notNull(),
  businessId: text('business_id'),
});

export const brickInventory = pgTable('brick_inventory', {
  id: text('id').primaryKey(),
  brickType: text('brick_type').notNull().unique(),
  totalQuantity: integer('total_quantity').notNull(),
  lastUpdated: timestamp('last_updated').notNull(),
  businessId: text('business_id'),
});

export const inventoryProducts = pgTable('inventory_products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  unit: text('unit').notNull(),
  description: text('description'),
  businessId: text('business_id'),
  isTracked: boolean('is_tracked').default(true),
});

export const trips = pgTable('trips', {
  id: text('id').primaryKey(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  startLat: doublePrecision('start_lat'),
  startLng: doublePrecision('start_lng'),
  endLat: doublePrecision('end_lat'),
  endLng: doublePrecision('end_lng'),
  distance: doublePrecision('distance').notNull(),
  isActive: boolean('is_active').notNull(),
  usageType: text('usage_type').notNull(),
  userId: text('user_id').notNull(),
  businessId: text('business_id'),
});

// --- Promo & User Tables ---

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'), // bcrypt hash; null only for legacy/unmigrated rows
  tier: text('tier').notNull().default('free'), // 'free' | 'premium' | 'enterprise'
  // Server-authoritative usage counters (client values are never trusted for gating)
  voiceCommandsUsed: integer('voice_commands_used').notNull().default(0),
  scansUsed: integer('scans_used').notNull().default(0),
  usagePeriodStart: timestamp('usage_period_start'),
  promoIsActive: boolean('promo_is_active').default(false),
  promoCode: text('promo_code'),
  promoActivatedAt: timestamp('promo_activated_at'),
  promoExpiresAt: timestamp('promo_expires_at'),
  originalPromoCode: text('original_promo_code'),
  convertedFromPromo: boolean('converted_from_promo').default(false),
  features: text('features'), // JSON string array
  apiKey: text('api_key').unique(), // For external API access (MCP/n8n)
  createdAt: timestamp('created_at').notNull(),
});

export const promoCodes = pgTable('promo_codes', {
  code: text('code').primaryKey(),
  trialDurationDays: integer('trial_duration_days').notNull(),
  maxRedemptions: integer('max_redemptions'), // null for unlimited
  currentRedemptions: integer('current_redemptions').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  expiresAt: timestamp('expires_at'),
  tier: text('tier').default('premium'),
  features: text('features'), // JSON string array
  createdAt: timestamp('created_at').notNull(),
});

export const promoRedemptions = pgTable('promo_redemptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  promoCode: text('promo_code').notNull().references(() => promoCodes.code),
  redeemedAt: timestamp('redeemed_at').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  convertedToPaid: boolean('converted_to_paid').default(false),
  convertedAt: timestamp('converted_at'),
}, (table) => ({
  // Enforce one redemption per user per code at the DB level so the check can't be raced.
  userCodeUnique: unique().on(table.userId, table.promoCode),
}));
