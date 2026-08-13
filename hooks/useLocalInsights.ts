
import { useMemo } from 'react';
import { Transaction, Category } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { startOfWeek, endOfWeek, subWeeks, isWithinInterval } from 'date-fns';

export interface LocalInsight {
    id: string;
    type: 'warning' | 'info' | 'success';
    title: string;
    description: string;
    action?: string;
}

export const useLocalInsights = (transactions: Transaction[], categories: Category[]) => {
    const { convertAmount, preferredCurrency } = useCurrency();

    const insights = useMemo(() => {
        const results: LocalInsight[] = [];
        const expenses = transactions.filter(t => t.type === 'expense');
        
        // 1. Duplicate Detection
        const seen = new Map<string, string>();
        expenses.forEach(tx => {
            const key = `${tx.amount}-${tx.date.toDateString()}-${tx.item}`;
            if (seen.has(key)) {
                results.push({
                    id: `dup-${tx.id}`,
                    type: 'warning',
                    title: 'Possible Duplicate',
                    description: `Found two entries for ${tx.item} with the same amount on ${tx.date.toLocaleDateString()}.`,
                    action: 'Review'
                });
            }
            seen.set(key, tx.id);
        });

        // 2. Uncategorized High Value
        const otherCategory = categories.find(c => c.name.toLowerCase() === 'other');
        if (otherCategory) {
            expenses.filter(tx => tx.categoryId === otherCategory.id).forEach(tx => {
                const amountInPreferred = convertAmount(tx.amount, tx.currency, preferredCurrency);
                if (amountInPreferred > 100) {
                    results.push({
                        id: `uncat-${tx.id}`,
                        type: 'info',
                        title: 'Uncategorized Large Expense',
                        description: `${tx.item} (${amountInPreferred.toFixed(2)} ${preferredCurrency}) is in "Other". Categorizing it helps AI give better advice.`,
                        action: 'Categorize'
                    });
                }
            });
        }

        // 3. Tax Opportunity (Vehicle logs vs Expenses)
        const businessTrips = transactions.filter(t => t.usageType === 'business' && (t.kilometers || 0) > 0);
        const fuelExpenses = expenses.filter(t => {
            const cat = categories.find(c => c.id === t.categoryId);
            return cat?.name.toLowerCase().includes('fuel') || cat?.name.toLowerCase().includes('gas');
        });

        if (businessTrips.length > 5 && fuelExpenses.length === 0) {
            results.push({
                id: 'tax-fuel',
                type: 'success',
                title: 'Tax Deduction Tip',
                description: "You've logged several business trips but no fuel expenses. Don't forget to log fuel to maximize your deductions!",
                action: 'Log Fuel'
            });
        }

        // 4. Budget Spike
        const now = new Date();
        const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
        const lastWeek = { start: startOfWeek(subWeeks(now, 1)), end: endOfWeek(subWeeks(now, 1)) };

        const thisWeekTotal = expenses
            .filter(t => isWithinInterval(t.date, thisWeek))
            .reduce((acc, t) => acc + convertAmount(t.amount, t.currency, preferredCurrency), 0);
            
        const lastWeekTotal = expenses
            .filter(t => isWithinInterval(t.date, lastWeek))
            .reduce((acc, t) => acc + convertAmount(t.amount, t.currency, preferredCurrency), 0);

        if (thisWeekTotal > lastWeekTotal * 1.5 && lastWeekTotal > 0) {
            results.push({
                id: 'budget-spike',
                type: 'warning',
                title: 'Spending Spike',
                description: `Your spending this week is ${(thisWeekTotal / lastWeekTotal).toFixed(1)}x higher than last week.`,
                action: 'Analyze'
            });
        }

        return results.slice(0, 3); // Only show top 3 local insights
    }, [transactions, categories, convertAmount, preferredCurrency]);

    return insights;
};
