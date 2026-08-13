import crypto from 'crypto';
import { generateTransactionPayload } from './hashUtils';

/**
 * Generates a consistent semantic hash for a transaction to enable cross-source deduplication.
 * This version uses Node.js 'crypto' and is intended for SERVER-SIDE use.
 */
export function generateTransactionHash(
    amount: number,
    date: Date | string,
    currency: string,
    merchant: string,
    time?: string
): string {
    const payload = generateTransactionPayload(amount, date, currency, merchant, time);
    return crypto.createHash('sha256').update(payload).digest('hex');
}
