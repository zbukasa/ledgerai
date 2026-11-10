import './src/loadEnv';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import morgan from 'morgan';
import crypto from 'crypto';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import { generateTransactionHash } from './services/serverHashUtils';
import { v4 as uuidv4 } from 'uuid';
import { BankSyncService } from './services/bank-connect/bank_sync_service';
import { MockBankProvider } from './services/bank-connect/providers/mock_provider';
import { BankProvider } from './services/bank-connect/providers/base';
import { BankConnection, BankTransaction } from './types';
import bcrypt from 'bcryptjs';
import { db } from './src/db';
import * as schema from './src/db/schema';
import { eq, and, inArray, isNull, sql, desc, gte, lte } from 'drizzle-orm';

// --- Secrets & required configuration ---
// All secrets must be provided via the environment. There are NO insecure defaults:
// a missing secret is a hard startup failure rather than a silent fallback to a
// publicly-known value.
function requireSecret(name: string): string {
    const value = process.env[name];
    if (!value || value.length < 16) {
        throw new Error(`${name} environment variable is required (min 16 chars). Refusing to start with an insecure default.`);
    }
    return value;
}

const JWT_SECRET = requireSecret('JWT_SECRET');
const INTERNAL_API_KEY = requireSecret('INTERNAL_API_KEY');
const BANK_TOKEN_ENCRYPTION_KEY = requireSecret('BANK_TOKEN_ENCRYPTION_KEY');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';
const JWT_SIGN_OPTIONS: jwt.SignOptions = { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] };
const BCRYPT_ROUNDS = 12;

const app = express();
const httpServer = createServer(app);

// Allowed browser origins for CORS + WebSocket. In production this must be an explicit
// allowlist; wildcard '*' would let any site make credentialed cross-origin calls.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
const isProd = process.env.NODE_ENV === 'production';
const corsOrigin = isProd
    ? (ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS : false)
    : true; // reflect request origin in dev only

const io = new Server(httpServer, {
    cors: {
        origin: corsOrigin,
        methods: ["GET", "POST"],
        credentials: true,
    }
});
const PORT = 3000;

// WebSocket auth: every socket must present a valid JWT. The room a socket may join is
// derived from the authenticated identity, NOT from a client-supplied id, so a client can
// never subscribe to or inject events for another tenant.
io.use((socket, next) => {
    const token = socket.handshake.auth?.token
        || (socket.handshake.headers?.authorization || '').split(' ')[1];
    if (!token) return next(new Error('Authentication required'));
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (err || !decoded?.id) return next(new Error('Invalid token'));
        (socket as any).userId = decoded.id;
        next();
    });
});

io.on('connection', (socket) => {
    const userId = (socket as any).userId as string;
    // Each authenticated user gets a private room keyed by their own id.
    const room = `user:${userId}`;
    socket.join(room);

    socket.on('data-change', (data) => {
        // Relay only within the sender's own room — the target room is fixed server-side.
        socket.to(room).emit('data-sync', { ...data, businessId: undefined });
    });

    socket.on('disconnect', () => {
        // Socket.IO cleans up room membership automatically.
    });
});

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});

// Stricter limiter for authentication endpoints to blunt credential-stuffing / brute force.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts, please try again later.' }
});

// Multer setup for receipt uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- Health Check ---
app.get('/api/health', async (req, res) => {
    if (!process.env.DATABASE_URL) {
        return res.status(500).json({
            status: 'error',
            database: 'disconnected',
            timestamp: new Date()
        });
    }

    try {
        // Simple query to test DB connection.
        await db.select({ count: sql<number>`count(*)` }).from(schema.users);
        res.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date(),
        });
    } catch (error) {
        // Log full diagnostics server-side only — never leak host, stack, or driver
        // error text to clients (it reveals schema/infra details to attackers).
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            timestamp: new Date(),
        });
    }
});

const authenticateAPIKey = async (req: any, res: any, next: any) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ error: 'API key required' });

    const [user] = await db.select().from(schema.users).where(eq(schema.users.apiKey, apiKey as string));
    if (!user) return res.status(403).json({ error: 'Invalid API key' });

    req.user = { id: user.id, email: user.email };
    next();
};

// --- API Router (v1) ---
const apiRouter = express.Router();
apiRouter.use(apiLimiter);

/**
 * @openapi
 * /api/v1/transactions:
 *   get:
 *     summary: List transactions with filters
 */
apiRouter.get('/transactions', authenticateAPIKey, async (req: any, res) => {
    try {
        const { type, startDate, endDate, categoryId, isArchived } = req.query;
        const conditions = [eq(schema.transactions.userId, req.user.id)];
        
        if (type) conditions.push(eq(schema.transactions.type, type as string));
        if (startDate) conditions.push(gte(schema.transactions.date, new Date(startDate as string)));
        if (endDate) conditions.push(lte(schema.transactions.date, new Date(endDate as string)));
        if (categoryId) conditions.push(eq(schema.transactions.categoryId, categoryId as string));
        if (isArchived !== undefined) conditions.push(eq(schema.transactions.isArchived, isArchived === 'true'));

        const results = await db.select().from(schema.transactions)
            .where(and(...conditions))
            .orderBy(desc(schema.transactions.date));
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

/**
 * @openapi
 * /api/v1/transactions:
 *   post:
 *     summary: Create a new transaction
 */
apiRouter.post('/transactions', authenticateAPIKey, async (req: any, res) => {
    try {
        const { date, type, amount, currency, item, categoryId, subCategoryId, merchant } = req.body;
        const newTx = {
            id: uuidv4(),
            date: new Date(date || Date.now()),
            type,
            amount: String(amount),
            currency,
            item,
            categoryId,
            subCategoryId,
            merchant,
            userId: req.user.id,
            createdAt: new Date()
        };
        await db.insert(schema.transactions).values(newTx);
        res.status(201).json(newTx);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

/**
 * @openapi
 * /api/v1/insights/summary:
 *   get:
 *     summary: Get financial summary
 */
apiRouter.get('/insights/summary', authenticateAPIKey, async (req: any, res) => {
    try {
        const txs = await db.select().from(schema.transactions).where(eq(schema.transactions.userId, req.user.id));
        
        const summary = txs.reduce((acc, tx) => {
            const amount = parseFloat(tx.amount);
            if (tx.type === 'income') acc.totalIncome += amount;
            else acc.totalExpense += amount;
            return acc;
        }, { totalIncome: 0, totalExpense: 0 });

        res.json({
            ...summary,
            net: summary.totalIncome - summary.totalExpense,
            currency: txs[0]?.currency || 'USD'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

/**
 * @openapi
 * /api/v1/categories:
 *   get:
 *     summary: List all categories
 */
apiRouter.get('/categories', authenticateAPIKey, async (req, res) => {
    const defaultCategories = [
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
    res.json(defaultCategories);
});

/**
 * @openapi
 * /api/v1/reports:
 *   get:
 *     summary: Get transaction report by category
 */
apiRouter.get('/reports', authenticateAPIKey, async (req: any, res) => {
    try {
        const results = await db.select({
            categoryId: schema.transactions.categoryId,
            // Use numeric (exact decimal), not float — money must not be summed in binary FP.
            total: sql<string>`sum(cast(${schema.transactions.amount} as numeric))`,
            count: sql<number>`count(*)`
        })
        .from(schema.transactions)
        .where(eq(schema.transactions.userId, req.user.id))
        .groupBy(schema.transactions.categoryId);

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

/**
 * @openapi
 * /api/v1/inventory/bricks:
 *   get:
 *     summary: List brick inventory
 */
apiRouter.get('/inventory/bricks', authenticateAPIKey, async (req: any, res) => {
    try {
        const results = await db.select().from(schema.brickInventory);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

/**
 * @openapi
 * /api/v1/inventory/batches:
 *   get:
 *     summary: List brick production batches
 */
apiRouter.get('/inventory/batches', authenticateAPIKey, async (req: any, res) => {
    try {
        const results = await db.select().from(schema.brickBatches).where(eq(schema.brickBatches.userId, req.user.id));
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch batches' });
    }
});

/**
 * @openapi
 * /api/v1/trips:
 *   get:
 *     summary: List vehicle trips
 */
apiRouter.get('/trips', authenticateAPIKey, async (req: any, res) => {
    try {
        const results = await db.select().from(schema.trips).where(eq(schema.trips.userId, req.user.id));
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch trips' });
    }
});

/**
 * @openapi
 * /api/v1/bank/connections:
 *   get:
 *     summary: List bank connections
 */
apiRouter.get('/bank/connections', authenticateAPIKey, async (req: any, res) => {
    try {
        // Never serialize encrypted access/refresh tokens to clients — select safe columns only.
        const results = await db.select({
            id: schema.bankConnections.id,
            userId: schema.bankConnections.userId,
            providerName: schema.bankConnections.providerName,
            status: schema.bankConnections.status,
            institutionId: schema.bankConnections.institutionId,
            createdAt: schema.bankConnections.createdAt,
            updatedAt: schema.bankConnections.updatedAt,
        }).from(schema.bankConnections).where(eq(schema.bankConnections.userId, req.user.id));
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bank connections' });
    }
});

/**
 * @openapi
 * /api/v1/bank/accounts/{connectionId}:
 *   get:
 *     summary: List accounts for a connection
 */
apiRouter.get('/bank/accounts/:connectionId', authenticateAPIKey, async (req: any, res) => {
    try {
        // Ownership check: the connection must belong to the authenticated user.
        const connection = await db.query.bankConnections.findFirst({
            where: and(
                eq(schema.bankConnections.id, req.params.connectionId),
                eq(schema.bankConnections.userId, req.user.id)
            )
        });
        if (!connection) return res.status(404).json({ error: 'Connection not found' });

        const results = await db.select().from(schema.bankAccounts).where(eq(schema.bankAccounts.connectionId, req.params.connectionId));
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bank accounts' });
    }
});

/**
 * @openapi
 * /api/v1/bank/transactions/{accountId}:
 *   get:
 *     summary: List transactions for an account
 */
apiRouter.get('/bank/transactions/:accountId', authenticateAPIKey, async (req: any, res) => {
    try {
        // Ownership check: resolve the account's connection and confirm it belongs to the user.
        const account = await db.query.bankAccounts.findFirst({
            where: eq(schema.bankAccounts.accountIdProvider, req.params.accountId)
        });
        if (account) {
            const owned = await db.query.bankConnections.findFirst({
                where: and(
                    eq(schema.bankConnections.id, account.connectionId),
                    eq(schema.bankConnections.userId, req.user.id)
                )
            });
            if (!owned) return res.status(404).json({ error: 'Account not found' });
        } else {
            return res.status(404).json({ error: 'Account not found' });
        }

        const results = await db.select().from(schema.bankTransactions).where(eq(schema.bankTransactions.accountId, req.params.accountId));
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bank transactions' });
    }
});

/**
 * @openapi
 * /api/v1/receipts/upload:
 *   post:
 *     summary: Upload a receipt image
 */
apiRouter.post('/receipts/upload', authenticateAPIKey, upload.single('receipt'), (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ 
        message: 'File uploaded successfully',
        url: `/uploads/${req.file.filename}`
    });
});

app.use('/api/v1', apiRouter);

// --- Auth Routes ---
const authRouter = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

authRouter.post('/register', authLimiter, async (req, res) => {
    const { email, password, name } = req.body || {};

    if (!email || !EMAIL_RE.test(email)) {
        return res.status(400).json({ error: 'A valid email is required.' });
    }
    if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    try {
        const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
        if (existing) {
            // Do not reveal whether the email is registered beyond a generic conflict.
            return res.status(409).json({ error: 'Unable to register with those details.' });
        }

        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        const id = uuidv4();
        await db.insert(schema.users).values({
            id,
            email,
            passwordHash,
            tier: 'free',
            apiKey: uuidv4(),
            usagePeriodStart: new Date(),
            createdAt: new Date(),
        });

        const token = jwt.sign({ id, email }, JWT_SECRET, JWT_SIGN_OPTIONS);
        // Note: name is currently a client-side profile concept; not persisted server-side.
        res.status(201).json({
            access_token: token,
            token_type: 'bearer',
            user: { id, email, name: name || null, tier: 'free' },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed.' });
    }
});

authRouter.post('/token', authLimiter, async (req, res) => {
    const source = req.body && Object.keys(req.body).length ? req.body : req.query;
    const email = (source.username || source.email) as string | undefined;
    const password = source.password as string | undefined;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) });

        // Constant-ish work whether or not the user exists, to avoid a user-enumeration
        // timing oracle. Always run a bcrypt compare against something.
        const hashToCheck = user?.passwordHash
            || '$2a$12$0000000000000000000000000000000000000000000000000000a'; // dummy, never matches
        const ok = await bcrypt.compare(password, hashToCheck);

        if (!user || !user.passwordHash || !ok) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, JWT_SIGN_OPTIONS);
        res.json({
            access_token: token,
            token_type: 'bearer',
            user: { id: user.id, email: user.email, tier: user.tier },
            // apiKey is intentionally NOT returned here; it is a long-lived credential
            // fetched only via an authenticated key-management endpoint.
        });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Authentication failed.' });
    }
});

app.use('/auth', authRouter);

const bankSyncService = new BankSyncService(BANK_TOKEN_ENCRYPTION_KEY);
const mockProvider = new MockBankProvider();
const bankProviders: Record<string, BankProvider> = { [mockProvider.name]: mockProvider };

type BankConnectionRow = typeof schema.bankConnections.$inferSelect;
type DbTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Revoke our access upstream (Plaid /item/remove) so the institution link stops existing
// at the provider too. Throws if the provider is unknown or the call fails.
async function revokeBankAccess(connection: BankConnectionRow): Promise<void> {
    const provider = bankProviders[connection.providerName];
    if (!provider) throw new Error(`No provider registered for '${connection.providerName}'`);
    await provider.revokeAccess(bankSyncService.decryptToken(connection.accessTokenEncrypted));
}

// Permanently delete everything retrieved through a bank connection: transactions, accounts,
// sync cursor and the encrypted tokens. Optionally also removes the ledger entries the user
// imported from it. Returns the number of ledger entries removed.
async function purgeBankConnection(
    tx: DbTx,
    connection: BankConnectionRow,
    purgeLedger: boolean
): Promise<number> {
    let ledgerRemoved = 0;
    if (purgeLedger) {
        // Imported ledger rows carry sourceRef = '<provider>:<providerTxnId>' (see Tier 1 ingest).
        // Matched via subquery so large histories don't hit the bind-parameter limit.
        const importedRefs = tx.select({
            ref: sql<string>`${connection.providerName} || ':' || ${schema.bankTransactions.providerTxnId}`
        })
            .from(schema.bankTransactions)
            .where(eq(schema.bankTransactions.connectionId, connection.id));
        const removed = await tx.delete(schema.transactions)
            .where(and(
                eq(schema.transactions.userId, connection.userId),
                inArray(schema.transactions.sourceRef, importedRefs)
            ))
            .returning({ id: schema.transactions.id });
        ledgerRemoved = removed.length;
    }

    await tx.delete(schema.bankTransactions).where(eq(schema.bankTransactions.connectionId, connection.id));
    await tx.delete(schema.bankSyncState).where(eq(schema.bankSyncState.connectionId, connection.id));
    await tx.delete(schema.bankAccounts).where(eq(schema.bankAccounts.connectionId, connection.id));
    await tx.delete(schema.bankConnections).where(eq(schema.bankConnections.id, connection.id));
    return ledgerRemoved;
}

// --- Auth Middleware ---
const authenticateJWT = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token) {
        jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
            if (err || !decoded?.id) return res.sendStatus(403);

            try {
                // Check promo expiration
                const user = await db.query.users.findFirst({
                    where: eq(schema.users.id, decoded.id)
                });

                if (user && user.promoIsActive && user.promoExpiresAt && new Date(user.promoExpiresAt) < new Date()) {
                    await db.update(schema.users)
                        .set({
                            promoIsActive: false,
                            tier: 'free' // Revert to free tier
                        })
                        .where(eq(schema.users.id, user.id));
                    
                    decoded.tier = 'free';
                    decoded.promoIsActive = false;
                } else if (user) {
                    decoded.tier = user.tier;
                    decoded.promoIsActive = user.promoIsActive;
                }
            } catch (e) {
                console.error('Error checking promo expiration:', e);
            }

            req.user = decoded;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

const authenticateInternal = (req: any, res: any, next: any) => {
    const raw = req.headers['x-internal-api-key'];
    const apiKey = Array.isArray(raw) ? raw[0] : raw;
    if (!apiKey || typeof apiKey !== 'string') {
        return res.status(401).json({ error: 'Missing internal API key' });
    }

    try {
        const keyBuffer = Buffer.from(INTERNAL_API_KEY);
        const inputBuffer = Buffer.from(apiKey);

        if (keyBuffer.length === inputBuffer.length && crypto.timingSafeEqual(keyBuffer, inputBuffer)) {
            next();
        } else {
            res.status(401).json({ error: 'Invalid internal API key' });
        }
    } catch (e) {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// --- Tier 1: LedgerAI Core Ingestion Routes ---
const coreRouter = express.Router();

coreRouter.post('/bank/transactions/bulk', authenticateInternal, async (req, res) => {
    const { transactions: incomingTxns } = req.body;
    
    // 1. Payload Validation
    if (!incomingTxns || !Array.isArray(incomingTxns)) {
        return res.status(400).json({ error: 'Invalid payload: transactions array is required' });
    }

    console.log(`[Tier 1] Processing ${incomingTxns.length} transactions for ingestion`);
    
    let inserted = 0;
    let skipped = 0;
    let needsReviewCount = 0;
    const insertedSourceRefs: string[] = [];

    // 2. Ingest each transaction independently. A conflict or bad row skips that one
    // row rather than aborting (and rolling back) the entire batch.
    for (const tx of incomingTxns) {
        // Validate ownership and amount before touching the DB. userId is required and
        // must be a real value — never fall back to a shared 'system' bucket.
        const amountNum = Number(tx.amount);
        if (!tx.userId || typeof tx.userId !== 'string') {
            skipped++;
            continue;
        }
        if (!Number.isFinite(amountNum)) {
            skipped++;
            continue;
        }

        const sourceRef = `${tx.providerName || 'bank'}:${tx.providerTxnId}`;

        // Semantic hash scoped implicitly per user via the (userId, hash) unique constraint.
        const hashIdempotency = generateTransactionHash(
            amountNum,
            tx.postedAt,
            tx.currency,
            tx.merchantName || ''
        );

        try {
            const newId = uuidv4();
            const result = await db.insert(schema.transactions).values({
                id: newId,
                date: new Date(tx.postedAt),
                type: amountNum < 0 ? 'expense' : 'income',
                amount: Math.abs(amountNum).toString(),
                currency: tx.currency,
                item: tx.description,
                merchant: tx.merchantName,
                categoryId: tx.ledgerCategory || 'Other',
                userId: tx.userId,
                source: 'bank',
                sourceRef: sourceRef,
                hashIdempotency: hashIdempotency,
                createdAt: new Date()
            })
                // Idempotent on external ref; a semantic-hash duplicate for the same user
                // is caught by the unique index and surfaces as a skip below.
                .onConflictDoNothing({ target: schema.transactions.sourceRef })
                .returning({ id: schema.transactions.id });

            if (result.length > 0) {
                insertedSourceRefs.push(sourceRef);
                inserted++;
                if (tx.needsReview) needsReviewCount++;
            } else {
                skipped++;
            }
        } catch (rowError: any) {
            // Unique-violation on the (userId, hash) index → genuine duplicate, skip quietly.
            if (rowError?.code === '23505') {
                skipped++;
            } else {
                console.error('[Tier 1] Row ingestion failed:', rowError?.message || rowError);
                skipped++;
            }
        }
    }

    res.json({
        summary: {
            inserted,
            skipped,
            needsReview: needsReviewCount,
            total: incomingTxns.length
        },
        insertedSourceRefs
    });
});

app.use('/integrations', coreRouter);

// --- Tier 2: Bank Connect Layer Routes ---
const bankRouter = express.Router();

// --- Transaction Routes ---
const transactionRouter = express.Router();

transactionRouter.get('/', authenticateJWT, async (req, res) => {
    const userId = (req as any).user.id;
    const { isArchived } = req.query;
    
    const conditions = [eq(schema.transactions.userId, userId)];
    if (isArchived !== undefined) {
        conditions.push(eq(schema.transactions.isArchived, isArchived === 'true'));
    }

    const txns = await db.query.transactions.findMany({
        where: and(...conditions),
        orderBy: [desc(schema.transactions.date)]
    });
    res.json(txns);
});

transactionRouter.post('/', authenticateJWT, async (req, res) => {
    const userId = (req as any).user.id;
    const data = req.body;
    const id = data.id || uuidv4();

    try {
        // Reject attempts to overwrite a transaction owned by another user.
        const existing = await db.query.transactions.findFirst({ where: eq(schema.transactions.id, id) });
        if (existing && existing.userId !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Strip client-supplied ownership/id fields so they can't be forged.
        const { userId: _u, id: _i, createdAt: _c, ...safe } = data;
        await db.insert(schema.transactions).values({
            ...safe,
            amount: data.amount?.toString(),
            id,
            userId,
            date: new Date(data.date),
            createdAt: new Date()
        }).onConflictDoUpdate({
            target: schema.transactions.id,
            set: {
                ...safe,
                amount: data.amount?.toString(),
                date: new Date(data.date),
                userId // never reassign owner
            }
        });

        const newTx = await db.query.transactions.findFirst({
            where: and(eq(schema.transactions.id, id), eq(schema.transactions.userId, userId))
        });
        res.json(newTx);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

transactionRouter.put('/:id', authenticateJWT, async (req, res) => {
    const userId = (req as any).user.id;
    const id = req.params.id;
    const data = req.body;
    
    try {
        await db.update(schema.transactions)
            .set({
                ...data,
                amount: data.amount?.toString(),
                date: data.date ? new Date(data.date) : undefined,
            })
            .where(and(
                eq(schema.transactions.id, id),
                eq(schema.transactions.userId, userId)
            ));
            
        const updatedTx = await db.query.transactions.findFirst({
            where: eq(schema.transactions.id, id)
        });
        res.json(updatedTx);
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ error: 'Failed to update transaction' });
    }
});

transactionRouter.delete('/:id', authenticateJWT, async (req, res) => {
    const userId = (req as any).user.id;
    const id = req.params.id;
    
    try {
        await db.delete(schema.transactions)
            .where(and(
                eq(schema.transactions.id, id),
                eq(schema.transactions.userId, userId)
            ));
            
        res.sendStatus(204);
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ error: 'Failed to delete transaction' });
    }
});

app.use('/transactions', transactionRouter);

// --- Inventory & Production Routes ---
const inventoryRouter = express.Router();

inventoryRouter.get('/products', authenticateJWT, async (req, res) => {
    const products = await db.query.brickInventory.findMany();
    res.json(products);
});

inventoryRouter.post('/products', authenticateJWT, async (req, res) => {
    const data = req.body;
    const id = data.id || uuidv4();
    try {
        await db.insert(schema.brickInventory).values({
            id,
            brickType: data.productType,
            totalQuantity: data.totalQuantity,
            lastUpdated: new Date(data.lastUpdated),
            businessId: data.businessId
        }).onConflictDoUpdate({
            target: schema.brickInventory.id,
            set: {
                totalQuantity: data.totalQuantity,
                lastUpdated: new Date(data.lastUpdated)
            }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving inventory product:', error);
        res.status(500).json({ error: 'Failed to update inventory' });
    }
});

inventoryRouter.get('/catalog', authenticateJWT, async (req, res) => {
    const products = await db.query.inventoryProducts.findMany();
    res.json(products);
});

inventoryRouter.post('/catalog', authenticateJWT, async (req, res) => {
    const data = req.body;
    const id = data.id || uuidv4();
    try {
        await db.insert(schema.inventoryProducts).values({
            ...data,
            id
        }).onConflictDoUpdate({
            target: schema.inventoryProducts.id,
            set: data
        });
        const product = await db.query.inventoryProducts.findFirst({
            where: eq(schema.inventoryProducts.id, id)
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save product' });
    }
});

inventoryRouter.get('/batches', authenticateJWT, async (req, res) => {
    const userId = (req as any).user.id;
    const batches = await db.query.brickBatches.findMany({
        where: eq(schema.brickBatches.userId, userId),
        orderBy: [desc(schema.brickBatches.date)]
    });
    res.json(batches);
});

inventoryRouter.post('/batches', authenticateJWT, async (req, res) => {
    const userId = (req as any).user.id;
    const data = req.body;
    const id = data.id || uuidv4();
    
    try {
        const { userId: _u, id: _i, productType, ...rest } = data;
        const batchData = {
            ...rest,
            id,
            userId,
            brickType: productType || data.brickType,
            date: new Date(data.date),
            curingStartDate: new Date(data.curingStartDate),
            mpaTestDate: data.mpaTestDate ? new Date(data.mpaTestDate) : null,
        };

        const newBatch = await db.transaction(async (tx) => {
            // Look up any existing batch (same id, same owner) so a resubmit applies only
            // the DELTA to inventory instead of double-counting the full quantity.
            const existing = await tx.query.brickBatches.findFirst({
                where: eq(schema.brickBatches.id, id)
            });
            if (existing && existing.userId !== userId) {
                throw Object.assign(new Error('Forbidden'), { httpStatus: 403 });
            }
            const previousQty = existing?.quantityProduced ?? 0;
            const newQty = data.quantityProduced ?? previousQty;
            const delta = newQty - previousQty;

            await tx.insert(schema.brickBatches).values(batchData).onConflictDoUpdate({
                target: schema.brickBatches.id,
                set: batchData
            });

            if (delta !== 0) {
                await tx.insert(schema.brickInventory).values({
                    id: uuidv4(),
                    brickType: batchData.brickType,
                    totalQuantity: delta,
                    lastUpdated: new Date(),
                    businessId: data.businessId
                }).onConflictDoUpdate({
                    target: schema.brickInventory.brickType,
                    set: {
                        totalQuantity: sql`${schema.brickInventory.totalQuantity} + ${delta}`,
                        lastUpdated: new Date()
                    }
                });
            }

            return await tx.query.brickBatches.findFirst({ where: eq(schema.brickBatches.id, id) });
        });

        res.json(newBatch);
    } catch (error: any) {
        if (error?.httpStatus === 403) return res.status(403).json({ error: 'Forbidden' });
        console.error('Error creating batch:', error);
        res.status(500).json({ error: 'Failed to create batch' });
    }
});

inventoryRouter.put('/batches/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const data = req.body;

    try {
        const oldBatch = await db.query.brickBatches.findFirst({
            where: and(eq(schema.brickBatches.id, id), eq(schema.brickBatches.userId, userId))
        });
        if (!oldBatch) return res.status(404).json({ error: 'Batch not found' });

        const updateData = {
            ...data,
            brickType: data.productType || data.brickType,
            date: data.date ? new Date(data.date) : undefined,
            curingStartDate: data.curingStartDate ? new Date(data.curingStartDate) : undefined,
            mpaTestDate: data.mpaTestDate ? new Date(data.mpaTestDate) : undefined,
        };
        delete (updateData as any).productType;

        await db.update(schema.brickBatches)
            .set(updateData)
            .where(and(eq(schema.brickBatches.id, id), eq(schema.brickBatches.userId, userId)));

        if (oldBatch && data.quantityProduced !== undefined) {
            const diff = data.quantityProduced - oldBatch.quantityProduced;
            await db.insert(schema.brickInventory).values({
                id: uuidv4(),
                brickType: data.brickType || oldBatch.brickType,
                totalQuantity: diff,
                lastUpdated: new Date(),
                businessId: data.businessId || oldBatch.businessId
            }).onConflictDoUpdate({
                target: schema.brickInventory.brickType,
                set: {
                    totalQuantity: sql`${schema.brickInventory.totalQuantity} + ${diff}`,
                    lastUpdated: new Date()
                }
            });
        }

        const updated = await db.query.brickBatches.findFirst({
            where: eq(schema.brickBatches.id, id)
        });
        res.json(updated);
    } catch (error) {
        console.error('Error updating batch:', error);
        res.status(500).json({ error: 'Failed to update batch' });
    }
});

inventoryRouter.delete('/batches/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const userId = (req as any).user.id;
    try {
        const batch = await db.query.brickBatches.findFirst({
            where: and(eq(schema.brickBatches.id, id), eq(schema.brickBatches.userId, userId))
        });
        if (!batch) return res.status(404).json({ error: 'Batch not found' });

        if (batch) {
            await db.insert(schema.brickInventory).values({
                id: uuidv4(),
                brickType: batch.brickType,
                totalQuantity: -batch.quantityProduced,
                lastUpdated: new Date(),
                businessId: batch.businessId
            }).onConflictDoUpdate({
                target: schema.brickInventory.brickType,
                set: {
                    totalQuantity: sql`${schema.brickInventory.totalQuantity} - ${batch.quantityProduced}`,
                    lastUpdated: new Date()
                }
            });
        }

        await db.delete(schema.brickBatches).where(and(eq(schema.brickBatches.id, id), eq(schema.brickBatches.userId, userId)));
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting batch:', error);
        res.status(500).json({ error: 'Failed to delete batch' });
    }
});

app.use('/inventory', inventoryRouter);

// --- Trip Routes ---
const tripRouter = express.Router();

tripRouter.get('/', authenticateJWT, async (req, res) => {
    const userId = (req as any).user.id;
    const trips = await db.query.trips.findMany({
        where: eq(schema.trips.userId, userId),
        orderBy: [desc(schema.trips.startTime)]
    });
    res.json(trips);
});

tripRouter.post('/', authenticateJWT, async (req, res) => {
    const userId = (req as any).user.id;
    const data = req.body;
    const id = data.id || uuidv4();
    
    try {
        // Guard against hijacking another user's row by posting its id: if the id already
        // exists under a different user, reject rather than overwriting.
        const existing = await db.query.trips.findFirst({ where: eq(schema.trips.id, id) });
        if (existing && existing.userId !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const { userId: _ignore, id: _id, ...safe } = data;
        await db.insert(schema.trips).values({
            ...safe,
            id,
            userId,
            startTime: new Date(data.startTime),
            endTime: data.endTime ? new Date(data.endTime) : null,
        }).onConflictDoUpdate({
            target: schema.trips.id,
            set: {
                ...safe,
                startTime: new Date(data.startTime),
                endTime: data.endTime ? new Date(data.endTime) : null,
                userId, // never let the owner be reassigned
            }
        });

        const newTrip = await db.query.trips.findFirst({
            where: and(eq(schema.trips.id, id), eq(schema.trips.userId, userId))
        });
        res.json(newTrip);
    } catch (error) {
        console.error('Error creating trip:', error);
        res.status(500).json({ error: 'Failed to create trip' });
    }
});

tripRouter.delete('/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const userId = (req as any).user.id;
    try {
        await db.delete(schema.trips).where(and(eq(schema.trips.id, id), eq(schema.trips.userId, userId)));
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting trip:', error);
        res.status(500).json({ error: 'Failed to delete trip' });
    }
});

app.use('/trips', tripRouter);

import { PromoCodeSystem } from './services/PromoCodeSystem';

// --- Promo Routes ---
const promoRouter = express.Router();

promoRouter.get('/validate/:code', authenticateJWT, async (req, res) => {
    const { code } = req.params;
    try {
        const promo = await PromoCodeSystem.validate(code);
        res.json(promo);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

promoRouter.post('/apply', authenticateJWT, async (req, res) => {
    const userId = (req as any).user.id;
    const { code } = req.body;

    try {
        const result = await PromoCodeSystem.apply(userId, code);
        const updatedUser = await db.query.users.findFirst({
            where: eq(schema.users.id, userId)
        });
        res.json({ success: true, user: updatedUser, expiresAt: result.expiresAt });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

app.use('/promo', promoRouter);

// --- Server-authoritative usage metering & account state ---
// The client UI may show paywalls for UX, but the *authoritative* limit is enforced here.
// Any metered action (AI insight, receipt scan, voice command) must call /usage/consume,
// which atomically checks and increments the counter for the user's real, server-known tier.
const USAGE_LIMITS: Record<string, Record<string, number>> = {
    free: { voiceCommands: 10, aiInsights: 5, receiptScans: 5 },
    premium: { voiceCommands: 1000, aiInsights: 1000, receiptScans: 1000 },
    enterprise: { voiceCommands: 100000, aiInsights: 100000, receiptScans: 100000 },
};
const METRIC_COLUMN: Record<string, 'voiceCommandsUsed' | 'scansUsed'> = {
    voiceCommands: 'voiceCommandsUsed',
    receiptScans: 'scansUsed',
    aiInsights: 'scansUsed', // insights share the scan bucket in the current model
};

function currentPeriodStart(): Date {
    // Monthly window anchored to the 1st. Date.now() is fine on the server runtime.
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

const accountRouter = express.Router();

// Authoritative account snapshot: never trust client-held tier/usage.
accountRouter.get('/me', authenticateJWT, async (req: any, res) => {
    const user = await db.query.users.findFirst({
        where: eq(schema.users.id, req.user.id),
        columns: {
            id: true, email: true, tier: true, promoIsActive: true, promoExpiresAt: true,
            features: true, voiceCommandsUsed: true, scansUsed: true, usagePeriodStart: true,
            passwordHash: false, apiKey: false,
        }
    });
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
});

// Atomically consume one unit of a metered resource; 429 if the tier limit is reached.
accountRouter.post('/usage/consume', authenticateJWT, async (req: any, res) => {
    const metric = String(req.body?.metric || '');
    const column = METRIC_COLUMN[metric];
    if (!column) return res.status(400).json({ error: 'Unknown metric' });

    try {
        const result = await db.transaction(async (tx) => {
            const user = await tx.query.users.findFirst({ where: eq(schema.users.id, req.user.id) });
            if (!user) return { status: 404 as const };

            // Reset the counters if we've rolled into a new monthly period.
            const periodStart = currentPeriodStart();
            const needsReset = !user.usagePeriodStart || new Date(user.usagePeriodStart) < periodStart;
            const used = needsReset ? 0 : (user[column] ?? 0);

            const tier = user.tier || 'free';
            const limit = USAGE_LIMITS[tier]?.[metric] ?? USAGE_LIMITS.free[metric] ?? 0;

            if (used >= limit) {
                return { status: 429 as const, limit, current: used };
            }

            await tx.update(schema.users)
                .set({
                    [column]: used + 1,
                    usagePeriodStart: periodStart,
                } as any)
                .where(eq(schema.users.id, req.user.id));

            return { status: 200 as const, limit, current: used + 1 };
        });

        if (result.status === 404) return res.status(404).json({ error: 'Not found' });
        if (result.status === 429) {
            return res.status(429).json({ error: 'Usage limit reached', limit: result.limit, current: result.current });
        }
        res.json({ ok: true, limit: result.limit, current: result.current });
    } catch (e) {
        console.error('Usage consume error:', e);
        res.status(500).json({ error: 'Failed to record usage' });
    }
});

// Permanently delete the account and all data we hold for it. Requires the current password
// so a stolen session token alone cannot destroy an account. Bank access is revoked
// best-effort: a provider outage must not block a user's right to deletion, so failures are
// logged for manual follow-up instead of aborting.
accountRouter.delete('/', authLimiter, authenticateJWT, async (req: any, res) => {
    const password = req.body?.password;
    if (typeof password !== 'string' || !password) {
        return res.status(400).json({ error: 'Password is required to delete your account.' });
    }

    try {
        const userId = req.user.id;
        const user = await db.query.users.findFirst({ where: eq(schema.users.id, userId) });
        if (!user) return res.status(404).json({ error: 'Not found' });
        if (!user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({ error: 'Incorrect password.' });
        }

        const connections = await db.query.bankConnections.findMany({
            where: eq(schema.bankConnections.userId, userId)
        });
        for (const connection of connections) {
            try {
                await revokeBankAccess(connection);
            } catch (e: any) {
                console.error(`[Account deletion] Revocation failed for connection ${connection.id} (${connection.providerName}); revoke manually:`, e?.message || e);
            }
        }

        await db.transaction(async (tx) => {
            for (const connection of connections) {
                await purgeBankConnection(tx, connection, false);
            }
            await tx.delete(schema.transactions).where(eq(schema.transactions.userId, userId));
            await tx.delete(schema.trips).where(eq(schema.trips.userId, userId));
            await tx.delete(schema.brickBatches).where(eq(schema.brickBatches.userId, userId));
            await tx.delete(schema.promoRedemptions).where(eq(schema.promoRedemptions.userId, userId));
            await tx.delete(schema.users).where(eq(schema.users.id, userId));
        });

        console.log(`[Account deletion] Deleted account ${userId} and ${connections.length} bank connection(s)`);
        res.json({ deleted: true });
    } catch (e) {
        console.error('Account deletion error:', e);
        res.status(500).json({ error: 'Account deletion failed.' });
    }
});

app.use('/account', accountRouter);

bankRouter.get('/connections', authenticateJWT, async (req, res) => {
    const userId = (req as any).user.id;
    // Return safe columns only — encrypted tokens must never leave the server.
    const connections = await db.query.bankConnections.findMany({
        where: eq(schema.bankConnections.userId, userId),
        columns: {
            id: true, userId: true, providerName: true, status: true,
            institutionId: true, createdAt: true, updatedAt: true,
            accessTokenEncrypted: false, refreshTokenEncrypted: false,
        }
    });
    res.json(connections);
});

bankRouter.get('/connections/:id/accounts', authenticateJWT, async (req, res) => {
    const userId = (req as any).user.id;
    const connectionId = req.params.id;
    // Ownership check before returning any account data.
    const connection = await db.query.bankConnections.findFirst({
        where: and(eq(schema.bankConnections.id, connectionId), eq(schema.bankConnections.userId, userId))
    });
    if (!connection) return res.status(404).json({ error: 'Connection not found' });

    const accounts = await db.query.bankAccounts.findMany({
        where: eq(schema.bankAccounts.connectionId, connectionId)
    });
    res.json(accounts);
});

// Unlink a bank: revoke access with the provider, then permanently delete everything retrieved
// through the connection. Ledger entries already imported are the user's own records and are
// kept unless ?purgeLedger=true. Revocation failure aborts (502) so the user can retry rather
// than leaving a live link at the provider that we no longer hold a token for.
bankRouter.delete('/connections/:id', authenticateJWT, async (req, res) => {
    const userId = (req as any).user.id;
    const purgeLedger = req.query.purgeLedger === 'true';

    try {
        const connection = await db.query.bankConnections.findFirst({
            where: and(eq(schema.bankConnections.id, req.params.id), eq(schema.bankConnections.userId, userId))
        });
        if (!connection) return res.status(404).json({ error: 'Connection not found' });

        try {
            await revokeBankAccess(connection);
        } catch (e: any) {
            console.error(`[Tier 2] Revocation failed for connection ${connection.id}:`, e?.message || e);
            return res.status(502).json({ error: 'Could not revoke bank access. Please try again.' });
        }

        const ledgerRemoved = await db.transaction(tx => purgeBankConnection(tx, connection, purgeLedger));
        console.log(`[Tier 2] Deleted bank connection ${connection.id} (ledger entries removed: ${ledgerRemoved})`);
        res.json({ deleted: true, ledger_transactions_removed: ledgerRemoved });
    } catch (e) {
        console.error('[Tier 2] Disconnect error:', e);
        res.status(500).json({ error: 'Failed to disconnect bank' });
    }
});

bankRouter.post('/link-token', authenticateJWT, async (req, res) => {
    const userId = (req as any).user.id;
    const token = await mockProvider.getLinkToken(userId);
    res.json({ link_token: token });
});

bankRouter.post('/exchange-token', authenticateJWT, async (req, res) => {
    const { public_token } = req.body;
    const userId = (req as any).user.id;
    
    const { accessToken, refreshToken, institutionId } = await mockProvider.exchangePublicToken(public_token);
    
    const connectionId = uuidv4();
    await db.insert(schema.bankConnections).values({
        id: connectionId,
        userId,
        providerName: 'mock',
        status: 'active',
        accessTokenEncrypted: bankSyncService.encryptToken(accessToken),
        refreshTokenEncrypted: refreshToken ? bankSyncService.encryptToken(refreshToken) : null,
        institutionId,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    console.log(`[Tier 2] Created bank connection: ${connectionId}`);
    res.json({ connection_id: connectionId, status: 'active' });
});

bankRouter.post('/sync', authenticateJWT, async (req, res) => {
    const { connection_id } = req.body;
    const userId = (req as any).user.id;

    // Ownership check: only the owner may sync a connection.
    const connection = await db.query.bankConnections.findFirst({
        where: and(eq(schema.bankConnections.id, connection_id), eq(schema.bankConnections.userId, userId))
    });

    if (!connection) return res.status(404).json({ error: 'Connection not found' });

    const syncState = await db.query.bankSyncState.findFirst({
        where: eq(schema.bankSyncState.connectionId, connection_id)
    });

    // Map DB connection back to type for service
    const connType: BankConnection = {
        ...connection,
        status: connection.status as any,
        refreshTokenEncrypted: connection.refreshTokenEncrypted || undefined
    };

    const { accounts, transactions, nextCursor } = await bankSyncService.syncConnection(mockProvider, connType, syncState as any);
    
    // 1. Batch Account Upsert (Performance + Atomicity)
    if (accounts.length > 0) {
        await db.insert(schema.bankAccounts).values(
            accounts.map(acc => ({
                id: uuidv4(),
                connectionId: connection_id,
                accountIdProvider: acc.accountIdProvider,
                name: acc.name,
                type: acc.type,
                currency: acc.currency,
                maskLast4: acc.maskLast4
            }))
        ).onConflictDoUpdate({
            target: [schema.bankAccounts.connectionId, schema.bankAccounts.accountIdProvider],
            set: {
                name: sql`excluded.name`,
                type: sql`excluded.type`,
                currency: sql`excluded.currency`,
                maskLast4: sql`excluded.mask_last4`
            }
        });
    }

    // 2. Persist transactions using onConflictDoNothing for concurrency safety
    const { inserted } = await bankSyncService.persistTransactions(connection_id, transactions);

    // Update sync state with cursor for incremental sync
    await db.insert(schema.bankSyncState).values({
        connectionId: connection_id,
        cursor: nextCursor || null,
        lastSyncedAt: new Date()
    }).onConflictDoUpdate({
        target: schema.bankSyncState.connectionId,
        set: { 
            cursor: nextCursor || null,
            lastSyncedAt: new Date() 
        }
    });
    
    res.json({ 
        message: 'Sync completed', 
        accounts_count: accounts.length, 
        transactions_count: inserted,
        duplicates_skipped: transactions.length - inserted,
        next_cursor: nextCursor
    });
});

bankRouter.post('/push-to-ledger', authenticateJWT, async (req, res) => {
    const { connection_id } = req.body;
    const userId = (req as any).user.id;

    // 0. Fetch connection to get providerName — scoped to the owner so a user can't
    // push another user's bank transactions into their own ledger.
    const connection = await db.query.bankConnections.findFirst({
        where: and(eq(schema.bankConnections.id, connection_id), eq(schema.bankConnections.userId, userId))
    });
    if (!connection) return res.status(404).json({ error: 'Connection not found' });

    // 1. Fetch un-ingested transactions for this connection. Scoped by connection, not by
    // provider account id, which is not guaranteed unique across users (e.g. mock ids).
    const txnsToPush = await db.query.bankTransactions.findMany({
        where: and(
            eq(schema.bankTransactions.connectionId, connection_id),
            isNull(schema.bankTransactions.ingestedAt)
        )
    });

    if (txnsToPush.length === 0) {
        return res.json({ 
            message: 'No new transactions to push', 
            result: { summary: { inserted: 0, skipped: 0, total: 0 } } 
        });
    }

    // 2. Push to Tier 1
    try {
        const response = await fetch(`http://localhost:${PORT}/integrations/bank/transactions/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-api-key': INTERNAL_API_KEY
            },
            body: JSON.stringify({ 
                transactions: txnsToPush.map(t => ({
                    ...t,
                    userId,
                    providerName: connection.providerName // Use connection.providerName
                }))
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Tier 2] Tier 1 ingestion failed: ${response.status} ${errorText}`);
            return res.status(502).json({ 
                error: 'Tier 1 ingestion failed', 
                details: errorText,
                status: response.status 
            });
        }

        const result = await response.json();

        // 3. Update ingestedAt for the transactions that were confirmed as inserted by Tier 1
        // Safety: match on both providerTxnId and accountId, scoped to this connection's accounts
        if (result.insertedSourceRefs && result.insertedSourceRefs.length > 0) {
            const insertedProviderTxnIds: string[] = [];
            
            for (const ref of result.insertedSourceRefs) {
                const index = ref.indexOf(':');
                if (index !== -1) {
                    const provider = ref.slice(0, index);
                    const providerTxnId = ref.slice(index + 1);
                    
                    if (provider === connection.providerName && providerTxnId.length > 0) {
                        insertedProviderTxnIds.push(providerTxnId);
                    }
                }
            }
            
            if (insertedProviderTxnIds.length > 0) {
                await db.update(schema.bankTransactions)
                    .set({ ingestedAt: new Date() })
                    .where(and(
                        inArray(schema.bankTransactions.providerTxnId, insertedProviderTxnIds),
                        eq(schema.bankTransactions.connectionId, connection_id)
                    ));
            }
        }

        res.json({ message: 'Push completed', result });
    } catch (error) {
        console.error('[Tier 2] Push error:', error);
        res.status(500).json({ error: 'Failed to push to ledger core' });
    }
});

app.use('/bank', bankRouter);

// --- Google Maps Proxy ---
const mapsRouter = express.Router();

mapsRouter.get('/autocomplete', authenticateJWT, async (req, res) => {
    const { input } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input as string)}&key=${apiKey}`
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Autocomplete error:', error);
        res.status(500).json({ error: 'Failed to fetch autocomplete suggestions' });
    }
});

mapsRouter.get('/distance', authenticateJWT, async (req, res) => {
    const { origin, destination } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin as string)}&destinations=${encodeURIComponent(destination as string)}&key=${apiKey}`
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Distance matrix error:', error);
        res.status(500).json({ error: 'Failed to calculate distance' });
    }
});

app.use('/api/maps', mapsRouter);

// --- Gemini AI Proxy ---
// The Gemini API key stays server-side ONLY. Clients send the same { model, contents, config }
// they used to pass to the SDK; we forward it with the real key and return the response.
// Every call is authenticated AND metered so free-tier limits are actually enforced.
const aiRouter = express.Router();

let genAIClient: import('@google/genai').GoogleGenAI | null = null;
async function getGenAI() {
    if (!process.env.GEMINI_API_KEY) return null;
    if (!genAIClient) {
        const { GoogleGenAI } = await import('@google/genai');
        genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return genAIClient;
}

// Atomically consume one unit of a metered AI resource for the authenticated user.
// Returns null on success, or an HTTP error tuple to send.
async function consumeAiUsage(userId: string, metric: 'aiInsights' | 'receiptScans' | 'voiceCommands') {
    const column = METRIC_COLUMN[metric];
    return await db.transaction(async (tx) => {
        const user = await tx.query.users.findFirst({ where: eq(schema.users.id, userId) });
        if (!user) return { status: 404, body: { error: 'Not found' } };
        const periodStart = currentPeriodStart();
        const needsReset = !user.usagePeriodStart || new Date(user.usagePeriodStart) < periodStart;
        const used = needsReset ? 0 : (user[column] ?? 0);
        const tier = user.tier || 'free';
        const limit = USAGE_LIMITS[tier]?.[metric] ?? USAGE_LIMITS.free[metric] ?? 0;
        if (used >= limit) return { status: 429, body: { error: 'Usage limit reached', limit, current: used } };
        await tx.update(schema.users)
            .set({ [column]: used + 1, usagePeriodStart: periodStart } as any)
            .where(eq(schema.users.id, userId));
        return null;
    });
}

aiRouter.post('/generate', authenticateJWT, async (req: any, res) => {
    const { model, contents, config, metric } = req.body || {};
    if (!model || !contents) {
        return res.status(400).json({ error: 'model and contents are required' });
    }
    const meteredMetric = (metric === 'receiptScans' || metric === 'aiInsights') ? metric : 'aiInsights';

    const ai = await getGenAI();
    if (!ai) return res.status(503).json({ error: 'AI service not configured' });

    // Enforce the usage limit server-side before spending an API call.
    const usageError = await consumeAiUsage(req.user.id, meteredMetric);
    if (usageError) return res.status(usageError.status).json(usageError.body);

    try {
        const response = await ai.models.generateContent({ model, contents, config });
        res.json({ text: response.text });
    } catch (error: any) {
        console.error('AI generate error:', error?.message || error);
        res.status(502).json({ error: 'AI request failed' });
    }
});

// Mint a short-lived ephemeral token for the live voice session so the long-lived key
// never reaches the client. The client uses this token with ai.live.connect().
aiRouter.post('/live-token', authenticateJWT, async (req: any, res) => {
    const ai = await getGenAI();
    if (!ai) return res.status(503).json({ error: 'AI service not configured' });

    // Meter voice usage at session-start.
    const usageError = await consumeAiUsage(req.user.id, 'voiceCommands');
    if (usageError) return res.status(usageError.status).json(usageError.body);

    try {
        const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min
        const token = await (ai as any).authTokens.create({
            config: {
                uses: 1,
                expireTime,
                httpOptions: { apiVersion: 'v1alpha' },
            },
        });
        res.json({ token: token.name, expireTime });
    } catch (error: any) {
        console.error('AI live-token error:', error?.message || error);
        res.status(502).json({ error: 'Failed to create live token' });
    }
});

app.use('/api/ai', aiRouter);

async function seedPromoCodes() {
    const existing = await db.query.promoCodes.findMany();
    if (existing.length > 0) return;

    const now = new Date();
    const expires30 = new Date(now);
    expires30.setDate(now.getDate() + 30);
    const expires14 = new Date(now);
    expires14.setDate(now.getDate() + 14);

    const codes = [
        {
            code: 'LAUNCH30',
            trialDurationDays: 30,
            maxRedemptions: 200,
            currentRedemptions: 0,
            isActive: true,
            expiresAt: expires14,
            tier: 'premium',
            features: JSON.stringify(['ad-free', 'unlimited-scans', 'advanced-analytics']),
            createdAt: now
        },
        {
            code: 'EARLYBIRD',
            trialDurationDays: 14,
            maxRedemptions: 500,
            currentRedemptions: 0,
            isActive: true,
            expiresAt: expires30,
            tier: 'premium',
            features: JSON.stringify(['ad-free', 'unlimited-scans']),
            createdAt: now
        },
        {
            code: 'TESTPROMO',
            trialDurationDays: 7,
            maxRedemptions: 1000,
            currentRedemptions: 0,
            isActive: true,
            expiresAt: expires30,
            tier: 'premium',
            features: JSON.stringify(['ad-free']),
            createdAt: now
        }
    ];

    for (const code of codes) {
        await db.insert(schema.promoCodes).values(code).onConflictDoNothing({ target: schema.promoCodes.code });
    }
    console.log('Promo codes seeded successfully');
}

// --- Vite Middleware ---
async function startServer() {
    if (!process.env.DATABASE_URL) {
        console.error('CRITICAL: DATABASE_URL environment variable is missing.');
        // In development, we might want to continue to show the error in the browser
        // but the server will likely crash on the first DB query.
    }

    try {
        await seedPromoCodes();
    } catch (error) {
        console.error('Error seeding promo codes:', error);
    }

    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    httpServer.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
