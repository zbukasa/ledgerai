import { BankConnection, BankAccount, BankTransaction, BankSyncState } from '../../types';
import { BankProvider } from './providers/base';
import { mapBankTransactionToLedger } from './category_mapper';
import fernet from 'fernet';
import crypto from 'crypto';
import { db } from '../../src/db';
import * as schema from '../../src/db/schema';
import { v4 as uuidv4 } from 'uuid';

export class BankSyncService {
    private encryptionKey: string;

    constructor(encryptionKey: string) {
        this.encryptionKey = encryptionKey;
    }

    private getSecret(): any {
        return new (fernet as any).Secret(this.encryptionKey);
    }

    encryptToken(token: string): string {
        const secret = this.getSecret();
        const time = Math.floor(Date.now() / 1000);
        const iv = crypto.randomBytes(16);
        
        const tokenObj = new (fernet as any).Token({
            secret: secret,
            time: time
        });
        tokenObj.iv = Array.from(iv);
        return tokenObj.encode(token);
    }

    decryptToken(encryptedToken: string): string {
        const tokenObj = new (fernet as any).Token({
            secret: this.getSecret(),
            token: encryptedToken,
            ttl: 0
        });
        return tokenObj.decode();
    }

    async syncConnection(
        provider: BankProvider,
        connection: BankConnection,
        syncState?: BankSyncState
    ): Promise<{ accounts: BankAccount[]; transactions: BankTransaction[]; nextCursor?: string }> {
        const accessToken = this.decryptToken(connection.accessTokenEncrypted);
        
        // 1. Fetch Accounts
        const accounts = await provider.fetchAccounts(accessToken);
        accounts.forEach(acc => acc.connectionId = connection.id);

        // 2. Fetch Transactions
        const startDate = syncState ? syncState.lastSyncedAt : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); 
        const endDate = new Date();
        
        const { transactions: providerTxns, nextCursor } = await provider.fetchTransactions(
            accessToken,
            startDate,
            endDate,
            syncState?.cursor
        );

        // 3. Normalize and Map Categories
        const normalizedTxns: BankTransaction[] = providerTxns.map(tx => {
            const mapping = mapBankTransactionToLedger(tx.merchantName, tx.description, tx.categoryRaw);
            return {
                ...tx,
                ledgerCategory: mapping.ledgerCategory,
                needsReview: mapping.needsReview,
                createdAt: new Date()
            };
        });

        return { accounts, transactions: normalizedTxns, nextCursor };
    }

    /**
     * Persists transactions to the database using onConflictDoNothing for idempotency.
     */
    async persistTransactions(transactions: BankTransaction[]): Promise<{ inserted: number }> {
        let insertedCount = 0;
        for (const tx of transactions) {
            try {
                const result = await db.insert(schema.bankTransactions).values({
                    id: uuidv4(),
                    accountId: tx.accountId,
                    providerTxnId: tx.providerTxnId,
                    postedAt: tx.postedAt,
                    amount: tx.amount.toString(),
                    currency: tx.currency,
                    merchantName: tx.merchantName,
                    description: tx.description,
                    categoryRaw: tx.categoryRaw,
                    ledgerCategory: tx.ledgerCategory,
                    confidence: (tx as any).confidence || 1.0,
                    pending: tx.pending,
                    hashIdempotency: tx.hashIdempotency,
                    needsReview: tx.needsReview || false,
                    createdAt: new Date()
                }).onConflictDoNothing({ target: schema.bankTransactions.hashIdempotency }).returning({ id: schema.bankTransactions.id });
                
                if (result.length > 0) {
                    insertedCount++;
                }
            } catch (error) {
                console.error('Error persisting transaction:', error);
            }
        }
        return { inserted: insertedCount };
    }
}
