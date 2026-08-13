
import { 
    HardHat, Fuel, Users, Wrench, Truck, Zap, DollarSign, Package,
    Car, ShoppingCart, Hammer, Home, Droplets, Banknote, HelpCircle,
    Receipt, Building, Leaf, Sprout, HeartPulse, Bus, BookOpen, Layers
} from 'lucide-react';
import { Category, SubCategory } from '../types';

export const iconMap = {
    HardHat, Fuel, Users, Wrench, Truck, Zap, DollarSign, Package,
    Car, ShoppingCart, Hammer, Home, Droplets, Banknote, HelpCircle,
    Receipt, Building, Leaf, Sprout, HeartPulse, Bus, BookOpen, Layers
};

export type IconName = keyof typeof iconMap;

export const availableIcons: IconName[] = Object.keys(iconMap) as IconName[];

export const getIconComponent = (iconName: IconName | undefined) => {
    return iconName ? iconMap[iconName] : Package;
};

export const getCategoryAndSubCategoryNames = (
    categoryId: string,
    subCategoryId: string | undefined,
    categories: Category[],
    subCategories: SubCategory[]
): { categoryName: string; subCategoryName: string } => {
    const category = categories.find(c => c.id === categoryId);
    const subCategory = subCategoryId ? subCategories.find(sc => sc.id === subCategoryId) : undefined;

    return {
        categoryName: category?.name || 'Unknown',
        subCategoryName: subCategory?.name || '',
    };
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                // Split to get only the base64 data, removing the data:image/... prefix if present
                const parts = reader.result.split(',');
                resolve(parts.length > 1 ? parts[1] : parts[0]);
            } else {
                reject('Failed to convert blob to base64');
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Format a Date as a `YYYY-MM-DD` string in the user's LOCAL timezone, for use as the
 * value of an <input type="date">. Using toISOString() here would shift the day for any
 * user west of UTC (e.g. a date picked as the 20th would render as the 19th).
 */
export const toDateInputValue = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

/**
 * Parse a `YYYY-MM-DD` value from an <input type="date"> into a Date at LOCAL midnight.
 * `new Date("2026-02-20")` parses as UTC midnight, which is the previous day in negative
 * offsets — this constructs the date in the local zone to keep the day stable.
 */
export const fromDateInputValue = (value: string): Date => {
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return new Date(value); // fall back for unexpected formats
    return new Date(y, m - 1, d);
};

export const convertDistance = (value: number, from: 'km' | 'miles', to: 'km' | 'miles'): number => {
    if (from === to) return value;
    if (from === 'km' && to === 'miles') return value * 0.621371;
    if (from === 'miles' && to === 'km') return value / 0.621371;
    return value;
};

export const formatDistance = (km: number, unit: 'km' | 'miles'): string => {
    const value = convertDistance(km, 'km', unit);
    return `${value.toFixed(1)} ${unit === 'km' ? 'KM' : 'MI'}`;
};
