
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Currency } from '../types';

export const currencyDetails: Record<Currency, { name: string, country: string, rate: number, decimals: number, pppFactor: number }> = {
    USD: { name: 'US Dollar', country: 'United States', rate: 1, decimals: 2, pppFactor: 1.0 },
    CDF: { name: 'Congolese Franc', country: 'DR Congo', rate: 2850, decimals: 0, pppFactor: 0.35 },
    CAD: { name: 'Canadian Dollar', country: 'Canada', rate: 1.37, decimals: 2, pppFactor: 0.95 },
    NGN: { name: 'Nigerian Naira', country: 'Nigeria', rate: 1480, decimals: 2, pppFactor: 0.30 },
    KES: { name: 'Kenyan Shilling', country: 'Kenya', rate: 132, decimals: 2, pppFactor: 0.40 },
    GHS: { name: 'Ghanaian Cedi', country: 'Ghana', rate: 14.5, decimals: 2, pppFactor: 0.45 },
    ZAR: { name: 'South African Rand', country: 'South Africa', rate: 18.8, decimals: 2, pppFactor: 0.55 },
    XOF: { name: 'West African CFA Franc', country: 'WAEMU', rate: 615, decimals: 0, pppFactor: 0.40 },
    XAF: { name: 'Central African CFA Franc', country: 'CEMAC', rate: 615, decimals: 0, pppFactor: 0.40 },
    TZS: { name: 'Tanzanian Shilling', country: 'Tanzania', rate: 2580, decimals: 0, pppFactor: 0.35 },
    UGX: { name: 'Ugandan Shilling', country: 'Uganda', rate: 3920, decimals: 0, pppFactor: 0.30 },
    RWF: { name: 'Rwandan Franc', country: 'Rwanda', rate: 1290, decimals: 0, pppFactor: 0.35 },
    ETB: { name: 'Ethiopian Birr', country: 'Ethiopia', rate: 57.5, decimals: 2, pppFactor: 0.30 },
    EGP: { name: 'Egyptian Pound', country: 'Egypt', rate: 48.2, decimals: 2, pppFactor: 0.40 },
    MAD: { name: 'Moroccan Dirham', country: 'Morocco', rate: 10.1, decimals: 2, pppFactor: 0.60 },
    INR: { name: 'Indian Rupee', country: 'India', rate: 83.4, decimals: 2, pppFactor: 0.33 },
    BRL: { name: 'Brazilian Real', country: 'Brazil', rate: 5.15, decimals: 2, pppFactor: 0.50 },
    MXN: { name: 'Mexican Peso', country: 'Mexico', rate: 16.8, decimals: 2, pppFactor: 0.65 },
    IDR: { name: 'Indonesian Rupiah', country: 'Indonesia', rate: 16200, decimals: 0, pppFactor: 0.40 },
    EUR: { name: 'Euro', country: 'European Union', rate: 0.93, decimals: 2, pppFactor: 1.0 },
    GBP: { name: 'British Pound', country: 'United Kingdom', rate: 0.80, decimals: 2, pppFactor: 1.0 },
    ARS: { name: 'Argentine Peso', country: 'Argentina', rate: 850, decimals: 2, pppFactor: 0.40 },
    COP: { name: 'Colombian Peso', country: 'Colombia', rate: 3900, decimals: 2, pppFactor: 0.45 },
    PEN: { name: 'Peruvian Sol', country: 'Peru', rate: 3.7, decimals: 2, pppFactor: 0.50 },
    CLP: { name: 'Chilean Peso', country: 'Chile', rate: 950, decimals: 0, pppFactor: 0.65 },
    UYU: { name: 'Uruguayan Peso', country: 'Uruguay', rate: 39, decimals: 2, pppFactor: 0.60 },
    BOB: { name: 'Bolivian Boliviano', country: 'Bolivia', rate: 6.9, decimals: 2, pppFactor: 0.40 },
    PYG: { name: 'Paraguayan Guarani', country: 'Paraguay', rate: 7300, decimals: 0, pppFactor: 0.40 },
    GTQ: { name: 'Guatemalan Quetzal', country: 'Guatemala', rate: 7.8, decimals: 2, pppFactor: 0.45 },
    CRC: { name: 'Costa Rican Colon', country: 'Costa Rica', rate: 500, decimals: 0, pppFactor: 0.60 },
    DOP: { name: 'Dominican Peso', country: 'Dominican Republic', rate: 59, decimals: 2, pppFactor: 0.50 },
    AOA: { name: 'Angolan Kwanza', country: 'Angola', rate: 830, decimals: 2, pppFactor: 0.35 },
    MZN: { name: 'Mozambican Metical', country: 'Mozambique', rate: 64, decimals: 2, pppFactor: 0.30 },
    CVE: { name: 'Cape Verdean Escudo', country: 'Cape Verde', rate: 102, decimals: 2, pppFactor: 0.45 },
    DZD: { name: 'Algerian Dinar', country: 'Algeria', rate: 135, decimals: 2, pppFactor: 0.40 },
    TND: { name: 'Tunisian Dinar', country: 'Tunisia', rate: 3.1, decimals: 2, pppFactor: 0.45 },
    AUD: { name: 'Australian Dollar', country: 'Australia', rate: 1.5, decimals: 2, pppFactor: 1.0 },
    NZD: { name: 'New Zealand Dollar', country: 'New Zealand', rate: 1.6, decimals: 2, pppFactor: 1.0 },
    SGD: { name: 'Singapore Dollar', country: 'Singapore', rate: 1.35, decimals: 2, pppFactor: 1.0 },
    PHP: { name: 'Philippine Peso', country: 'Philippines', rate: 56, decimals: 2, pppFactor: 0.35 },
    PKR: { name: 'Pakistani Rupee', country: 'Pakistan', rate: 280, decimals: 2, pppFactor: 0.25 },
    CHF: { name: 'Swiss Franc', country: 'Switzerland', rate: 0.90, decimals: 2, pppFactor: 1.0 },
    JMD: { name: 'Jamaican Dollar', country: 'Jamaica', rate: 155, decimals: 2, pppFactor: 0.50 },
    TTD: { name: 'Trinidad and Tobago Dollar', country: 'Trinidad and Tobago', rate: 6.8, decimals: 2, pppFactor: 0.65 },
    GYD: { name: 'Guyanese Dollar', country: 'Guyana', rate: 209, decimals: 2, pppFactor: 0.45 },
    BZD: { name: 'Belize Dollar', country: 'Belize', rate: 2.0, decimals: 2, pppFactor: 0.55 },
    HTG: { name: 'Haitian Gourde', country: 'Haiti', rate: 132, decimals: 2, pppFactor: 0.35 },
    MOP: { name: 'Macanese Pataca', country: 'Macau', rate: 8.0, decimals: 2, pppFactor: 0.85 },
    hi: { name: 'Indian Rupee (Hindi)', country: 'India', rate: 83.4, decimals: 2, pppFactor: 0.33 },
    ar: { name: 'UAE Dirham (Arabic)', country: 'UAE', rate: 3.67, decimals: 2, pppFactor: 0.80 },
};

export const allCurrencies: Currency[] = Object.keys(currencyDetails) as Currency[];

interface CurrencyContextType {
    preferredCurrency: Currency;
    setPreferredCurrency: (currency: Currency) => void;
    convertAmount: (amount: number, from: string, to: string) => number;
    formatAmount: (amount: number, currency: string) => string;
    getDecimalPlaces: (currency: string) => number;
    allCurrencies: Currency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [preferredCurrency, setPreferredCurrencyState] = useState<Currency>(() => {
        const stored = localStorage.getItem('preferredCurrency') as Currency;
        if (allCurrencies.includes(stored)) return stored;

        // Try to detect from browser locale
        try {
            const detectedCurrency = new Intl.NumberFormat().resolvedOptions().currency as Currency;
            if (detectedCurrency && allCurrencies.includes(detectedCurrency)) {
                return detectedCurrency;
            }
        } catch (e) {
            console.warn("Currency detection failed", e);
        }

        return 'CDF'; // Default fallback
    });

    useEffect(() => {
        localStorage.setItem('preferredCurrency', preferredCurrency);
    }, [preferredCurrency]);

    const setPreferredCurrency = (currency: Currency) => {
        setPreferredCurrencyState(currency);
    };

    const convertAmount = (amount: number, from: string, to: string): number => {
        const fromCode = (from || 'USD').toUpperCase().trim() as Currency;
        const toCode = (to || 'USD').toUpperCase().trim() as Currency;

        if (fromCode === toCode) return amount;

        const fromData = currencyDetails[fromCode];
        const toData = currencyDetails[toCode];

        // If we don't have a rate for either currency we CANNOT safely convert. Returning the
        // raw amount would silently mix currencies in totals (a real financial error). Warn
        // loudly and return NaN so callers/UI can render an explicit "unavailable" state
        // rather than a wrong number.
        if (!fromData || !toData || !fromData.rate || !toData.rate) {
            console.error(`convertAmount: missing exchange rate for ${fromCode}→${toCode}; refusing to guess.`);
            return NaN;
        }

        const amountInUsd = amount / fromData.rate;
        return amountInUsd * toData.rate;
    };

    const formatAmount = (amount: number, currency: string) => {
        try {
            const code = (currency || 'USD').toUpperCase().trim() as Currency;
            const decimals = currencyDetails[code]?.decimals ?? 2;
            
            // Use a generic formatter or try to detect locale
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: code,
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            }).format(amount);
        } catch (e) {
            console.warn('Currency formatting failed', e);
            return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
    };
    
    const getDecimalPlaces = (currency: string) => {
        const code = (currency || 'USD').toUpperCase().trim() as Currency;
        return currencyDetails[code]?.decimals ?? 2;
    };

    const value = {
        preferredCurrency,
        setPreferredCurrency,
        convertAmount,
        formatAmount,
        getDecimalPlaces,
        allCurrencies,
    };

    return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = (): CurrencyContextType => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
