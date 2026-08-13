import { BankAccount, BankTransaction } from '../../../types';

export interface BankProvider {
    name: string;
    getLinkToken(userId: string): Promise<string>;
    exchangePublicToken(publicToken: string): Promise<{ accessToken: string; refreshToken?: string; institutionId: string }>;
    fetchAccounts(accessToken: string): Promise<BankAccount[]>;
    fetchTransactions(accessToken: string, startDate: Date, endDate: Date, cursor?: string): Promise<{ transactions: BankTransaction[]; nextCursor?: string }>;
}
