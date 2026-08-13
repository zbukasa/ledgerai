
import { QuickAddAction } from './types';

export const AVAILABLE_QUICK_ACTIONS: QuickAddAction[] = [
    { id: 'scan', labelKey: 'nav.scan', icon: 'Camera', actionType: 'scan' },
    { id: 'fuel', labelKey: 'dashboard.addFuel', icon: 'Fuel', actionType: 'fuel' },
    { id: 'payroll', labelKey: 'dashboard.payWorker', icon: 'Users', actionType: 'payroll' },
    { id: 'materials', labelKey: 'dashboard.buyMaterials', icon: 'HardHat', actionType: 'materials' },
    { id: 'income', labelKey: 'dashboard.addIncome', icon: 'TrendingUp', actionType: 'income', isIncome: true },
    { id: 'production', labelKey: 'inventory.recordProduction', icon: 'Plus', actionType: 'production' },
    { id: 'trip', labelKey: 'trip.startTrip', icon: 'Navigation', actionType: 'trip' }
];

export const DEFAULT_QUICK_ACTIONS = ['scan', 'production', 'fuel', 'income'];

export const DEVELOPER_EMAILS = [
    'znrconsultinggroup@gmail.com',
    'tradelab.mantis@gmail.com'
];
