/**
 * Frontend-safe version of the payload generator.
 * Does NOT use Node.js crypto.
 * 
 * Implements robust normalization:
 * - Amount: Fixed 2 decimal places, preserves sign (e.g., 12.5 -> "12.50")
 * - Date/Time: Normalized to UTC ISO string format to avoid timezone false negatives
 * - Currency: Uppercase, trimmed
 * - Merchant: Lowercase, preserves numeric tokens (e.g., "Shell 101" -> "shell 101"), collapses whitespace
 */
export function generateTransactionPayload(
    amount: number,
    date: Date | string,
    currency: string,
    merchant: string,
    time?: string
): string {
    // 1. Normalize Amount (Fixed 2 decimal places, stringified consistently)
    const normalizedAmount = Number(amount).toFixed(2);

    // 2. Normalize Date & Time to UTC
    // We aim for a canonical UTC representation.
    let dateObj: Date;
    if (typeof date === 'string') {
        // If time is provided separately, combine it
        if (time && !date.includes('T') && !date.includes(':')) {
            // Try to parse as local time if no timezone is present
            dateObj = new Date(`${date.split('T')[0]} ${time}`);
        } else {
            dateObj = new Date(date);
        }
    } else {
        dateObj = date;
    }

    // If the date is invalid, fallback to current date (though this shouldn't happen with good data)
    if (isNaN(dateObj.getTime())) {
        dateObj = new Date();
    }

    // Use toISOString() for canonical UTC representation
    const isoString = dateObj.toISOString();
    const normalizedDate = isoString.split('T')[0];
    
    // Use the time from the ISO string (UTC) unless it's exactly midnight and we have no reason to believe it's UTC midnight
    // Actually, for hashing, the UTC time is the most stable canonical form.
    const normalizedTime = isoString.split('T')[1].split('.')[0];

    // 3. Normalize Currency (Uppercase)
    const normalizedCurrency = (currency || 'USD').toUpperCase().trim();

    // 4. Normalize Merchant
    // - Lowercase
    // - Remove punctuation but PRESERVE alphanumeric tokens (including numbers like "Shell 101")
    // - Collapse multiple spaces
    // - Trim
    const normalizedMerchant = (merchant || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ') // Replace punctuation with space to avoid merging words
        .replace(/\s+/g, ' ')
        .trim();

    // 5. Construct Payload
    // Format: amount|date|time|currency|merchant
    return `${normalizedAmount}|${normalizedDate}|${normalizedTime}|${normalizedCurrency}|${normalizedMerchant}`;
}
