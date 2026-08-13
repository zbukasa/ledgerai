import { BankProvider } from './base';
import { BankAccount, BankTransaction } from '../../../types';
import { v4 as uuidv4 } from 'uuid';

export class MockBankProvider implements BankProvider {
    name = 'mock';

    async getLinkToken(userId: string): Promise<string> {
        return `mock_link_token_${userId}_${Date.now()}`;
    }

    async exchangePublicToken(publicToken: string): Promise<{ accessToken: string; refreshToken?: string; institutionId: string }> {
        return {
            accessToken: `mock_access_token_${uuidv4()}`,
            refreshToken: `mock_refresh_token_${uuidv4()}`,
            institutionId: 'ins_mock_123'
        };
    }

    async fetchAccounts(accessToken: string): Promise<BankAccount[]> {
        return [
            {
                id: uuidv4(),
                connectionId: 'temp',
                accountIdProvider: 'acc_mock_checking',
                name: 'Mock Checking Account',
                type: 'checking',
                currency: 'USD',
                maskLast4: '1234'
            },
            {
                id: uuidv4(),
                connectionId: 'temp',
                accountIdProvider: 'acc_mock_savings',
                name: 'Mock Savings Account',
                type: 'savings',
                currency: 'USD',
                maskLast4: '5678'
            }
        ];
    }

    async fetchTransactions(accessToken: string, startDate: Date, endDate: Date, cursor?: string): Promise<{ transactions: BankTransaction[]; nextCursor?: string }> {
        // Stable mock transactions
        const transactions: BankTransaction[] = [
            {
                id: 'mock-txn-1',
                accountId: 'acc_mock_checking',
                providerTxnId: 'txn_mock_stable_001',
                postedAt: new Date('2026-02-20T10:00:00Z'),
                amount: -45.50,
                currency: 'USD',
                merchantName: 'Starbucks',
                description: 'Coffee purchase',
                categoryRaw: 'Food & Drink',
                pending: false,
                hashIdempotency: 'hash_mock_stable_001',
                createdAt: new Date('2026-02-20T10:00:00Z')
            },
            {
                id: 'mock-txn-2',
                accountId: 'acc_mock_checking',
                providerTxnId: 'txn_mock_stable_002',
                postedAt: new Date('2026-02-21T14:30:00Z'),
                amount: -1200.00,
                currency: 'USD',
                merchantName: 'Shell Oil',
                description: 'Fuel for truck',
                categoryRaw: 'Travel',
                pending: false,
                hashIdempotency: 'hash_mock_stable_002',
                createdAt: new Date('2026-02-21T14:30:00Z')
            }
        ];
        return { transactions, nextCursor: undefined };
    }
}
