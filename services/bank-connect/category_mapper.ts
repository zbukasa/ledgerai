import { Category } from '../../types';

export interface MappingResult {
    ledgerCategory: string;
    needsReview: boolean;
    confidence: number;
}

export const mapBankTransactionToLedger = (
    merchantName?: string,
    description?: string,
    categoryRaw?: string
): MappingResult => {
    const text = `${merchantName || ''} ${description || ''} ${categoryRaw || ''}`.toLowerCase();
    let ledgerCategory = 'Other';
    let confidence = 0.5;

    // Fuel
    if (text.includes('shell') || text.includes('total') || text.includes('fuel') || text.includes('gas station') || text.includes('petrol')) {
        ledgerCategory = 'Fuel';
        confidence = 0.9;
    }
    // Materials
    else if (text.includes('hardware') || text.includes('cement') || text.includes('gravel') || text.includes('builder') || text.includes('construction')) {
        ledgerCategory = 'Materials';
        confidence = 0.85;
    }
    // Payroll
    else if (text.includes('salary') || text.includes('wage') || text.includes('payroll') || text.includes('payment to worker')) {
        ledgerCategory = 'Payroll';
        confidence = 0.95;
    }
    // Maintenance
    else if (text.includes('repair') || text.includes('garage') || text.includes('mechanic') || text.includes('spare parts') || text.includes('tire')) {
        ledgerCategory = 'Maintenance';
        confidence = 0.8;
    }
    // Transport
    else if (text.includes('truck') || text.includes('freight') || text.includes('logistics') || text.includes('delivery')) {
        ledgerCategory = 'Transport';
        confidence = 0.8;
    }
    // Utilities
    else if (text.includes('electric') || text.includes('water') || text.includes('utility') || text.includes('internet') || text.includes('telecom')) {
        ledgerCategory = 'Utilities';
        confidence = 0.9;
    }
    // Income
    else if (text.includes('sale') || text.includes('payment received') || text.includes('invoice') || text.includes('deposit')) {
        ledgerCategory = 'Income';
        confidence = 0.85;
    }

    const CONFIDENCE_THRESHOLD = 0.65;
    const needsReview = confidence < CONFIDENCE_THRESHOLD;

    return { ledgerCategory, needsReview, confidence };
};
