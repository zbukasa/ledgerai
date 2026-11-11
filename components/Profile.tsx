
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, LogOut, Settings, DollarSign, Sun, Moon, Monitor, Bot, Plus, Edit, Trash2, X, Check, Package, ChevronDown, ChevronUp, Briefcase, Globe, Voicemail, RefreshCw, Camera, Upload, Sunset, PenLine, UserCheck, Building, LayoutGrid, Users, ChevronRight, Star, Zap, Building2, Shield, Lock as LucideLock, Leaf, Ruler } from 'lucide-react';
import { useCurrency, currencyDetails } from '../contexts/CurrencyContext';
import { useTheme, Theme } from '../contexts/ThemeContext';
import { useCategories } from '../contexts/CategoryContext';
import { Category, SubCategory, User } from '../types';
import { availableIcons, getIconComponent, IconName, blobToBase64 } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { dataService } from '../services/dataService';
import CameraCapture from './CameraCapture';
import SubscriptionPage from './SubscriptionPage';
import LegalScreen from './LegalScreen';
import { DEVELOPER_EMAILS } from '../constants';
import DatabaseStatus from './DatabaseStatus';

import { AuditLogView } from './AuditLogView';
import { HapticService } from '../services/hapticService';
import SecuritySettings from './SecuritySettings';

interface ProfileProps {
    initialView?: 'main' | 'subscription' | 'audit-log' | 'legal';
}

const Profile: React.FC<ProfileProps> = ({ initialView = 'main' }) => {
    const { preferredCurrency, setPreferredCurrency, allCurrencies } = useCurrency();
    const { theme, setTheme } = useTheme();
    const { currentUser, logout, updateUser, isPersonalMode, setPersonalMode, business, leaveBusiness, users, deleteUser, updateBusiness, hasFeature, isTrialActive, startTrial } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const { addToast } = useNotification();
    const [isAccountModalOpen, setAccountModalOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isLanguageExpanded, setIsLanguageExpanded] = useState(false);
    const [isAppearanceExpanded, setIsAppearanceExpanded] = useState(false);
    const [view, setView] = useState<'main' | 'subscription' | 'audit-log' | 'legal'>(initialView);

    useEffect(() => {
        if (initialView) {
            setView(initialView);
        }
    }, [initialView]);

    if (!currentUser) return null;

    if (view === 'subscription') {
        return <SubscriptionPage onBack={() => setView('main')} />;
    }

    if (view === 'audit-log') {
        return <AuditLogView onBack={() => setView('main')} />;
    }

    if (view === 'legal') {
        return <LegalScreen onBack={() => setView('main')} />;
    }

    const handleSaveAccount = (name: string, avatarUrl: string) => {
        HapticService.impactMedium();
        updateUser(currentUser.id, { name, avatarUrl });
        setAccountModalOpen(false);
        HapticService.notificationSuccess();
    }

    const handleManualSync = async () => {
        HapticService.impactMedium();
        if (!navigator.onLine) {
            addToast(t('notifications.offlineSyncError'), "error");
            return;
        }
        setIsSyncing(true);
        try {
            await dataService.syncNow();
            HapticService.notificationSuccess();
            addToast(t('notifications.syncSuccess'), "success");
        } catch (error) {
            HapticService.notificationError();
            addToast(t('notifications.syncError'), "error");
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto pb-20">
             <AnimatePresence>
                {isAccountModalOpen && (
                    <AccountModal 
                        user={currentUser}
                        onClose={() => setAccountModalOpen(false)}
                        onSave={handleSaveAccount}
                    />
                )}
            </AnimatePresence>
            
            <div className="flex justify-between items-end pb-4 border-b border-[var(--border-primary-translucent)]">
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-white)] tracking-tight">
                    {t('profile.title')}
                </h1>
                <button onClick={() => logout()} className="flex items-center space-x-2 px-4 py-2 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-interactive-hover)] transition-all text-sm font-semibold">
                    <LogOut size={16} />
                    <span>{t('security.signOut')}</span>
                </button>
            </div>

            {/* User Card */}
            <div className="bg-[var(--bg-secondary)] p-5 rounded-3xl border border-[var(--border-primary-translucent)] shadow-sm flex items-center gap-5">
                <div className="relative shrink-0">
                    <img
                        src={currentUser.avatarUrl}
                        alt="User Avatar"
                        className="w-20 h-20 rounded-full border-2 border-[var(--bg-primary)] object-cover shadow-md"
                    />
                    <button 
                        onClick={() => setAccountModalOpen(true)}
                        className="absolute -bottom-1 -right-1 bg-[var(--accent-primary)] text-white p-1.5 rounded-full hover:brightness-110 transition-all shadow-sm"
                    >
                        <Camera size={14} />
                    </button>
                </div>
                <div className="flex-grow min-w-0">
                    <h2 className="text-xl font-bold text-[var(--text-white)] truncate">{currentUser.name}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                            {currentUser.role === 'Admin' ? t('profile.administrator') : t('profile.member')}
                        </div>
                        <button 
                            onClick={() => setAccountModalOpen(true)} 
                            className="text-[var(--accent-primary-light)] text-xs font-bold hover:underline flex items-center gap-1"
                        >
                            <Edit size={12} />
                            {t('profile.editDetails')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Subscription Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                    onClick={() => setView('subscription')}
                    className="bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary-dark)] p-6 rounded-3xl border border-black/10 shadow-lg cursor-pointer hover:scale-[1.02] transition-all group"
                >
                    <div className="flex flex-col justify-between h-full gap-4">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="p-3 rounded-2xl bg-black/10 backdrop-blur-md text-[var(--text-contrast)]">
                                {(isPersonalMode ? (currentUser?.tier || 'free') : (business?.tier || 'free')) === 'free' && <Zap size={24} />}
                                {(isPersonalMode ? (currentUser?.tier || 'free') : (business?.tier || 'free')) === 'premium' && <Star size={24} />}
                                {(isPersonalMode ? (currentUser?.tier || 'free') : (business?.tier || 'free')) === 'enterprise' && <Building2 size={24} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[var(--text-contrast)] leading-tight">{t('subscription.title')}</h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-[var(--text-contrast)]/90 text-sm mt-0.5">
                                        <span className="font-bold capitalize">{t(`subscription.${isPersonalMode ? (currentUser?.tier || 'free') : (business?.tier || 'free')}`)}</span>
                                    </p>
                                    {(isTrialActive || currentUser?.promoIsActive) && (
                                        <span className="px-2 py-0.5 bg-black/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-[var(--text-contrast)]">
                                            {currentUser?.promoIsActive ? t('subscription.promo.active') : t('subscription.trialActive')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--text-contrast)] font-bold text-sm">
                            <span>{t('subscription.manage')}</span>
                            <ChevronRight size={18} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => {
                        if (hasFeature('AUDIT_LOGS')) {
                            setView('audit-log');
                        } else {
                            setView('subscription');
                            addToast(t('subscription.upgradeRequired'), 'info');
                        }
                    }}
                    className={`p-6 rounded-3xl border shadow-sm cursor-pointer transition-all group relative overflow-hidden ${
                        hasFeature('AUDIT_LOGS')
                            ? 'bg-[var(--bg-secondary)] border-[var(--border-primary-translucent)] hover:bg-[var(--bg-tertiary)]'
                            : 'bg-[var(--bg-secondary)] border-[var(--border-primary-translucent)] opacity-80 grayscale-[0.5]'
                    }`}
                >
                    <div className="flex flex-col justify-between h-full gap-4">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className={`p-3 rounded-2xl ${
                                hasFeature('AUDIT_LOGS')
                                    ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                            }`}>
                                <Shield size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight">{t('subscription.features.auditLogs')}</h3>
                                    {!hasFeature('AUDIT_LOGS') && (
                                        <LucideLock size={14} className="text-[var(--text-tertiary)]" />
                                    )}
                                </div>
                                <p className="text-[var(--text-tertiary)] text-sm mt-0.5">
                                    {hasFeature('AUDIT_LOGS') 
                                        ? t('subscription.complianceAndSecurity') 
                                        : t('subscription.enterpriseOnly')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--accent-primary)] font-bold text-sm">
                            <span>{hasFeature('AUDIT_LOGS') ? t('subscription.viewLogs') : t('subscription.unlockFeature')}</span>
                            <ChevronRight size={18} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>
            
            <SecuritySettings />

            {/* Sync Status */}
            <div className="bg-[var(--bg-secondary)] p-6 rounded-3xl border border-[var(--border-primary-translucent)] flex justify-between items-center shadow-sm">
                 <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full bg-[var(--bg-tertiary)] text-[var(--accent-primary-light)] ${isSyncing ? 'animate-spin' : ''}`}>
                        <RefreshCw size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-[var(--text-primary)]">{t('profile.dataSync')}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">{t('profile.syncDescription')}</p>
                    </div>
                </div>
                <button 
                    onClick={handleManualSync} 
                    disabled={isSyncing}
                    className="px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md active:scale-95 transition-transform"
                >
                    {isSyncing ? t('profile.syncing') : t('profile.syncNow')}
                </button>
            </div>

            {/* Context Switcher */}
            <div className="bg-[var(--bg-secondary)] p-6 rounded-3xl border border-[var(--border-primary-translucent)] shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--accent-primary-light)]">
                        <LayoutGrid size={20} />
                    </div>
                    <h3 className="font-bold text-[var(--text-primary)] text-lg">{t('profile.activeProfile')}</h3>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-6">
                    {t('profile.contextDescription')}
                </p>
                <div className="flex p-1 bg-[var(--bg-tertiary)] rounded-xl">
                    <button 
                        onClick={() => setPersonalMode(true)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${isPersonalMode ? 'bg-blue-500/20 text-blue-400 shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
                    >
                        <UserCheck size={18} />
                        {t('profile.personal')}
                    </button>
                    <button 
                        onClick={() => setPersonalMode(false)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${!isPersonalMode ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
                    >
                        <Building size={18} />
                        {business?.name || t('profile.organization')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[var(--bg-secondary)] p-6 rounded-3xl border border-[var(--border-primary-translucent)] shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--accent-primary-light)]">
                            <DollarSign size={20} />
                        </div>
                        <h3 className="font-bold text-[var(--text-primary)] text-lg">{t('profile.defaultCurrency')}</h3>
                    </div>
                    <select
                        value={preferredCurrency}
                        onChange={(e) => setPreferredCurrency(e.target.value as any)}
                        className="w-full bg-[var(--bg-primary)] p-3 rounded-xl text-[var(--text-primary)] font-semibold border border-transparent focus:border-[var(--accent-primary)] outline-none cursor-pointer"
                    >
                        {allCurrencies.map(c => (
                            <option key={c} value={c}>
                                {c} - {currencyDetails[c]?.country || c}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="bg-[var(--bg-secondary)] p-6 rounded-3xl border border-[var(--border-primary-translucent)] shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--accent-primary-light)]">
                            <Ruler size={20} />
                        </div>
                        <h3 className="font-bold text-[var(--text-primary)] text-lg">{t('profile.distanceUnit')}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {(['km', 'miles'] as const).map(unit => (
                            <button
                                key={unit}
                                onClick={() => {
                                    HapticService.impactLight();
                                    if (isPersonalMode && currentUser) {
                                        updateUser(currentUser.id, { distanceUnit: unit });
                                    } else if (!isPersonalMode && business) {
                                        updateBusiness({ settings: { ...business.settings, distanceUnit: unit } });
                                    }
                                }}
                                className={`py-3 px-4 rounded-xl font-bold text-sm transition-all border ${
                                    (isPersonalMode ? currentUser?.distanceUnit : business?.settings?.distanceUnit) === unit || 
                                    (!(isPersonalMode ? currentUser?.distanceUnit : business?.settings?.distanceUnit) && unit === 'km')
                                    ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-lg shadow-[var(--accent-primary)]/20' 
                                    : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-primary-translucent)] hover:border-[var(--text-tertiary)]'
                                }`}
                            >
                                {t(`profile.units.${unit}`)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-[var(--bg-secondary)] p-1 rounded-3xl border border-[var(--border-primary-translucent)] shadow-sm overflow-hidden">
                    <div 
                        onClick={() => setIsLanguageExpanded(!isLanguageExpanded)} 
                        className="w-full flex justify-between items-center p-5 rounded-2xl hover:bg-[var(--bg-interactive-hover)] transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--accent-primary-light)]">
                                <Globe size={20} />
                            </div>
                            <h3 className="font-bold text-[var(--text-primary)] text-lg">{t('profile.language')}</h3>
                        </div>
                        {isLanguageExpanded ? <ChevronUp size={20} className="text-[var(--text-secondary)]" /> : <ChevronDown size={20} className="text-[var(--text-secondary)]" />}
                    </div>
                    <AnimatePresence>
                        {isLanguageExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-6 pt-0">
                                    <div className="grid grid-cols-2 gap-3">
                                        {['en', 'fr', 'ln', 'sw', 'es', 'pt', 'hi', 'ar'].map(lang => (
                                            <button
                                                key={lang}
                                                onClick={() => {
                                                    HapticService.impactLight();
                                                    setLanguage(lang as any);
                                                }}
                                                className={`py-2 px-4 rounded-lg font-semibold text-sm transition-all ${language === lang ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}
                                            >
                                                {t(`profile.languages.${lang}`)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="bg-[var(--bg-secondary)] p-1 rounded-3xl border border-[var(--border-primary-translucent)] shadow-sm overflow-hidden md:col-span-2">
                    <div 
                        onClick={() => setIsAppearanceExpanded(!isAppearanceExpanded)} 
                        className="w-full flex justify-between items-center p-5 rounded-2xl hover:bg-[var(--bg-interactive-hover)] transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--accent-primary-light)]">
                                <Monitor size={20} />
                            </div>
                            <h3 className="font-bold text-[var(--text-primary)] text-lg">{t('profile.appearance')}</h3>
                        </div>
                        {isAppearanceExpanded ? <ChevronUp size={20} className="text-[var(--text-secondary)]" /> : <ChevronDown size={20} className="text-[var(--text-secondary)]" />}
                    </div>
                    <AnimatePresence>
                        {isAppearanceExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-6 pt-0">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                        <ThemeChip 
                                            label={t('profile.themes.light')} 
                                            icon={Sun} 
                                            active={theme === 'light'} 
                                            onClick={() => setTheme('light')} 
                                        />
                                        <ThemeChip 
                                            label={t('profile.themes.dark')} 
                                            icon={Moon} 
                                            active={theme === 'dark'} 
                                            onClick={() => setTheme('dark')} 
                                        />
                                        <ThemeChip 
                                            label={t('profile.themes.black')} 
                                            icon={Monitor} 
                                            active={theme === 'true-black'} 
                                            onClick={() => setTheme('true-black')} 
                                        />
                                        <ThemeChip 
                                            label={t('profile.themes.cyborg')} 
                                            icon={Bot} 
                                            active={theme === 'cyborg'} 
                                            onClick={() => setTheme('cyborg')} 
                                        />
                                        <ThemeChip 
                                            label={t('profile.themes.terminal')} 
                                            icon={Settings} 
                                            active={theme === 'terminal'} 
                                            onClick={() => setTheme('terminal')} 
                                        />
                                        <ThemeChip 
                                            label={t('profile.themes.sunset')} 
                                            icon={Sunset} 
                                            active={theme === 'sunset'} 
                                            onClick={() => setTheme('sunset')} 
                                        />
                                        <ThemeChip 
                                            label={t('profile.themes.earthy')} 
                                            icon={Leaf} 
                                            active={theme === 'earthy'} 
                                            onClick={() => setTheme('earthy')} 
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <OrganizationSettings />
            <CategoryManager />
            <VoiceCommandGuide />

            {/* Legal & Compliance Section */}
            <div 
                onClick={() => setView('legal')}
                className="bg-[var(--bg-secondary)] p-6 rounded-3xl border border-[var(--border-primary-translucent)] flex justify-between items-center shadow-sm cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors group"
            >
                 <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-[var(--bg-tertiary)] text-[var(--accent-primary-light)]">
                        <Shield size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-[var(--text-primary)]">{t('legal.title')}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">{t('legal.subtitle')}</p>
                    </div>
                </div>
                <ChevronRight size={20} className="text-[var(--text-tertiary)] group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </div>

            {/* Developer-only Database Status */}
            {currentUser.email && DEVELOPER_EMAILS.includes(currentUser.email) && (
                <div className="pt-10 opacity-50 hover:opacity-100 transition-opacity">
                    <DatabaseStatus />
                </div>
            )}

        </div>
    );
};

const OrganizationSettings = () => {
    const { t } = useLanguage();
    const { business, updateBusiness, leaveBusiness, currentUser, users, deleteUser, joinBusiness, updateUser, hasFeature } = useAuth();
    const { addToast } = useNotification();
    const [isExpanded, setIsExpanded] = useState(false);

    // ... (rest of state)

    if (!hasFeature('MULTI_USER')) {
        return (
            <div className="bg-[var(--bg-secondary)] p-1 rounded-3xl border border-[var(--border-primary-translucent)] shadow-sm overflow-hidden opacity-75">
                <div 
                    onClick={() => addToast(t('subscription.upgradeRequired'), 'info')}
                    className="w-full flex justify-between items-center p-5 rounded-2xl hover:bg-[var(--bg-interactive-hover)] transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">
                            <Users size={20} />
                        </div>
                        <div className="flex items-center gap-2">
                            <h2 className="font-bold text-[var(--text-primary)] text-lg">{t('profile.orgAndTeam')}</h2>
                            <LucideLock size={14} className="text-[var(--text-tertiary)]" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--accent-primary)] font-bold text-xs">
                        <span>{t('subscription.enterpriseOnly')}</span>
                        <ChevronRight size={16} />
                    </div>
                </div>
            </div>
        );
    }
    const [name, setName] = useState(business?.name || '');
    const [type, setType] = useState(business?.businessType || '');
    const [description, setDescription] = useState(business?.description || '');
    const [joinCode, setJoinCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    useEffect(() => {
        setName(business?.name || '');
        setType(business?.businessType || '');
        setDescription(business?.description || '');
    }, [business]);

    const handleSave = () => {
        HapticService.impactMedium();
        updateBusiness({ name, businessType: type, description });
        addToast(t('notifications.orgUpdated'), "success");
    };

    const handleJoin = async () => {
        HapticService.impactMedium();
        if (joinCode.length !== 6) return;
        setIsJoining(true);
        const success = await joinBusiness(joinCode);
        if (success) {
            HapticService.notificationSuccess();
            setJoinCode('');
            // Reset local state to match new business
            // The business object from useAuth will update automatically
        } else {
            HapticService.notificationError();
        }
        setIsJoining(false);
    };

    const isAdmin = currentUser?.role === 'Admin' || (business?.adminId === currentUser?.id);

    return (
        <div className="bg-[var(--bg-secondary)] p-1 rounded-3xl border border-[var(--border-primary-translucent)] shadow-sm overflow-hidden">
             <div 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="w-full flex justify-between items-center p-5 rounded-2xl hover:bg-[var(--bg-interactive-hover)] transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--accent-primary-light)]">
                        <Users size={20} />
                    </div>
                    <h2 className="font-bold text-[var(--text-primary)] text-lg">{t('profile.orgAndTeam')}</h2>
                </div>
                <div className="flex items-center gap-3">
                    <span className="hidden sm:inline text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest bg-[var(--bg-tertiary)] px-2 py-1 rounded-md">
                        {isAdmin ? t('profile.administrator') : t('profile.member')}
                    </span>
                    {isExpanded ? <ChevronUp size={20} className="text-[var(--text-secondary)]" /> : <ChevronDown size={20} className="text-[var(--text-secondary)]" />}
                </div>
            </div>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 pt-0 space-y-8">
                            {/* Business Details */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">{t('profile.orgDetails')}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1.5 ms-1">{t('profile.companyName')}</label>
                                        <input 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            disabled={!isAdmin}
                                            className="w-full bg-[var(--bg-primary)] p-3.5 rounded-xl outline-none ring-1 ring-transparent focus:ring-[var(--accent-primary)] text-[var(--text-primary)] transition-all disabled:opacity-60"
                                            placeholder={t('profile.companyName')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1.5 ms-1">{t('profile.businessType')}</label>
                                        <input 
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                            disabled={!isAdmin}
                                            className="w-full bg-[var(--bg-primary)] p-3.5 rounded-xl outline-none ring-1 ring-transparent focus:ring-[var(--accent-primary)] text-[var(--text-primary)] transition-all disabled:opacity-60"
                                            placeholder={t('profile.businessTypePlaceholder')}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1.5 ms-1">{t('profile.businessDescription')}</label>
                                    <textarea 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        disabled={!isAdmin}
                                        className="w-full bg-[var(--bg-primary)] p-3.5 rounded-xl outline-none ring-1 ring-transparent focus:ring-[var(--accent-primary)] text-[var(--text-primary)] transition-all resize-none h-20 disabled:opacity-60"
                                        placeholder={t('profile.businessDescriptionPlaceholder')}
                                    />
                                </div>
                                {isAdmin && (
                                    <button 
                                        onClick={handleSave}
                                        className="w-full py-3 bg-[var(--accent-primary)] text-white font-bold rounded-xl hover:brightness-110 shadow-md active:scale-[0.98] transition-all text-sm"
                                    >
                                        {t('profile.updateDetails')}
                                    </button>
                                )}
                            </div>

                            {/* Invite Section */}
                            <div className="pt-6 border-t border-[var(--border-primary-translucent)]">
                                <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4">{t('profile.inviteMembers')}</h4>
                                <div className="p-5 bg-[var(--bg-primary)] rounded-2xl border border-dashed border-[var(--accent-primary)]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-center sm:text-start">
                                        <label className="block text-[10px] font-bold text-[var(--accent-primary-light)] uppercase tracking-widest mb-1">{t('profile.inviteCode')}</label>
                                        <span className="text-3xl font-mono font-bold text-[var(--text-primary)] tracking-widest">{business?.inviteCode}</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(business?.inviteCode || '');
                                            addToast(t('notifications.inviteCodeCopied'), "success");
                                        }}
                                        className="w-full sm:w-auto px-6 py-3 bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-bold rounded-xl hover:bg-[var(--bg-interactive-hover)] transition-all flex items-center justify-center gap-2 border border-[var(--border-primary-translucent)]"
                                    >
                                        <RefreshCw size={16} />
                                        {t('profile.copyCode')}
                                    </button>
                                </div>
                            </div>

                            {/* Join Section */}
                            <div className="pt-6 border-t border-[var(--border-primary-translucent)]">
                                <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4">{t('profile.joinOrg')}</h4>
                                <div className="p-5 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--border-primary-translucent)] space-y-4">
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        {t('profile.joinOrgDescription')}
                                    </p>
                                    <div className="flex gap-3">
                                        <input 
                                            value={joinCode}
                                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                            maxLength={6}
                                            className="flex-1 bg-[var(--bg-primary)] p-3.5 rounded-xl outline-none ring-1 ring-transparent focus:ring-[var(--accent-primary)] text-[var(--text-primary)] transition-all font-mono font-bold tracking-widest"
                                            placeholder="ABC123"
                                        />
                                        <button 
                                            onClick={handleJoin}
                                            disabled={joinCode.length !== 6 || isJoining}
                                            className="px-6 py-3 bg-[var(--accent-primary)] text-white font-bold rounded-xl hover:brightness-110 shadow-md active:scale-[0.98] transition-all text-sm disabled:opacity-50"
                                        >
                                            {isJoining ? t('common.loading') : t('profile.joinAction')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Settings */}
                            {isAdmin && (
                                <div className="pt-6 border-t border-[var(--border-primary-translucent)]">
                                    <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4">{t('profile.privacyControls')}</h4>
                                    <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-primary-translucent)]">
                                        <div>
                                            <p className="text-sm font-bold text-[var(--text-primary)]">{t('profile.restrictIncome')}</p>
                                            <p className="text-xs text-[var(--text-secondary)]">{t('profile.restrictIncomeDescription')}</p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                HapticService.impactLight();
                                                updateBusiness({ settings: { ...business?.settings, restrictIncomeVisibility: !business?.settings?.restrictIncomeVisibility } });
                                            }}
                                            className={`w-12 h-6 rounded-full transition-all relative ${business?.settings?.restrictIncomeVisibility ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-primary)]'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${business?.settings?.restrictIncomeVisibility ? 'start-7' : 'start-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Team List */}
                            <div className="pt-6 border-t border-[var(--border-primary-translucent)]">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">{t('profile.teamMembers')}</h4>
                                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full">
                                        {t('profile.totalMembers', { count: users.filter(u => u.businessId === business?.id || (business?.id === 'biz-1' && !u.businessId)).length })}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {users.filter(u => u.businessId === business?.id || (business?.id === 'biz-1' && !u.businessId)).map(user => (
                                        <div key={user.id} className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-primary-translucent)] hover:border-[var(--accent-primary)]/20 transition-all">
                                            <div className="flex items-center gap-3">
                                                <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full border border-[var(--border-primary-translucent)]" referrerPolicy="no-referrer" />
                                                <div>
                                                    <p className="text-sm font-bold text-[var(--text-primary)]">{user.name} {user.id === currentUser?.id && t('profile.you')}</p>
                                                    <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider">
                                                        {user.role === 'Admin' ? t('profile.administrator') : (user.role === 'Manager' ? t('profile.manager') : t('profile.member'))}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isAdmin && user.id !== currentUser?.id && (
                                                    <select 
                                                        value={user.role}
                                                        onChange={(e) => {
                                                            HapticService.impactLight();
                                                            const newRole = e.target.value as any;
                                                            // Prevent changing the organization owner's role
                                                            if (user.id === business?.adminId) {
                                                                HapticService.notificationError();
                                                                addToast(t('notifications.cannotChangeOwnerRole'), "error");
                                                                return;
                                                            }
                                                            updateUser(user.id, { role: newRole });
                                                            HapticService.notificationSuccess();
                                                        }}
                                                        className="text-[10px] font-bold bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary-translucent)] rounded px-2 py-1 outline-none focus:border-[var(--accent-primary)]"
                                                    >
                                                        <option value="Admin">{t('profile.administrator')}</option>
                                                        <option value="Manager">{t('profile.manager')}</option>
                                                        <option value="Member">{t('profile.member')}</option>
                                                    </select>
                                                )}
                                                {isAdmin && user.id !== currentUser?.id && (
                                                    <button 
                                                        onClick={() => {
                                                            HapticService.impactMedium();
                                                            deleteUser(user.id);
                                                            HapticService.notificationSuccess();
                                                        }}
                                                        className="p-2 text-[var(--negative-text)] hover:bg-red-500/10 rounded-lg transition-all"
                                                        title="Remove from team"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Danger Zone */}
                            {business && business.id !== 'biz-1' && (
                                <div className="pt-6 border-t border-[var(--border-primary-translucent)]">
                                    {!showLeaveConfirm ? (
                                        <button 
                                            onClick={() => setShowLeaveConfirm(true)}
                                            className="w-full py-3 bg-red-500/10 text-[var(--negative-text)] font-bold rounded-xl hover:bg-red-500/20 transition-all text-sm border border-red-500/20"
                                        >
                                            {t('profile.leaveOrg')}
                                        </button>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-xs text-[var(--negative-text)] font-medium text-center">
                                                {t('profile.leaveOrgConfirmation')}
                                            </p>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => setShowLeaveConfirm(false)}
                                                    className="flex-1 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-bold rounded-xl hover:bg-[var(--bg-interactive-hover)] transition-all text-xs border border-[var(--border-primary-translucent)]"
                                                >
                                                    {t('common.cancel')}
                                                </button>
                                                <button 
                                                    onClick={async () => {
                                                        HapticService.impactMedium();
                                                        await leaveBusiness();
                                                        HapticService.notificationSuccess();
                                                        setShowLeaveConfirm(false);
                                                    }}
                                                    className="flex-1 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all text-xs shadow-md"
                                                >
                                                    {t('profile.leaveOrg')}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const CategoryManager = () => {
    const { t } = useLanguage();
    const { categories, subCategories, addCategory, deleteCategory } = useCategories();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatIcon, setNewCatIcon] = useState<IconName>('Package');

    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!newCatName.trim()) {
            HapticService.notificationError();
            return;
        }
        HapticService.impactMedium();
        addCategory(newCatName, newCatIcon);
        setNewCatName('');
        setIsAdding(false);
        HapticService.notificationSuccess();
    };

    return (
        <div className="bg-[var(--bg-secondary)] p-1 rounded-3xl border border-[var(--border-primary-translucent)] shadow-sm overflow-hidden">
             <div 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="w-full flex justify-between items-center p-5 rounded-2xl hover:bg-[var(--bg-interactive-hover)] transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--accent-primary-light)]">
                        <Package size={20} />
                    </div>
                    <h2 className="font-bold text-[var(--text-primary)] text-lg">{t('profile.manageCategories')}</h2>
                </div>
                {isExpanded ? <ChevronUp size={20} className="text-[var(--text-secondary)]" /> : <ChevronDown size={20} className="text-[var(--text-secondary)]" />}
            </div>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 pt-0 space-y-4">
                            <div className="grid grid-cols-1 gap-2">
                                {categories.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-primary)] group transition-all hover:border-[var(--accent-primary)]/30">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--accent-primary-light)]">
                                                {React.createElement(getIconComponent(cat.icon), { size: 16 })}
                                            </div>
                                            <span className="font-semibold text-[var(--text-primary)]">{cat.name}</span>
                                        </div>
                                        <button 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                HapticService.impactMedium();
                                                deleteCategory(cat.id); 
                                                HapticService.notificationSuccess();
                                            }}
                                            className="p-2 text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all md:opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {isAdding ? (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-[var(--bg-tertiary)] rounded-2xl space-y-4 shadow-inner" onClick={(e) => e.stopPropagation()}>
                                    <input 
                                        autoFocus
                                        value={newCatName}
                                        onChange={(e) => setNewCatName(e.target.value)}
                                        className="w-full bg-[var(--bg-primary)] p-4 rounded-xl outline-none ring-1 ring-transparent focus:ring-[var(--accent-primary)] text-[var(--text-primary)] transition-all"
                                        placeholder={t('profile.categoryName')}
                                    />
                                    <div className="flex flex-wrap gap-2 py-1">
                                        {availableIcons.slice(0, 12).map(icon => (
                                            <button 
                                                key={icon}
                                                onClick={() => setNewCatIcon(icon)}
                                                className={`p-2.5 rounded-xl transition-all ${newCatIcon === icon ? 'bg-[var(--accent-primary)] text-white shadow-md scale-110' : 'bg-[var(--bg-primary)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
                                            >
                                                {React.createElement(getIconComponent(icon), { size: 18 })}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button onClick={(e) => { e.stopPropagation(); setIsAdding(false); }} className="flex-1 py-3 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{t('common.cancel')}</button>
                                        <button onClick={handleAdd} className="flex-[2] py-4 px-6 rounded-xl bg-[var(--accent-primary)] text-white font-bold text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all">{t('profile.createCategory')}</button>
                                    </div>
                                </motion.div>
                            ) : (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsAdding(true); }}
                                    className="w-full py-5 border-2 border-dashed border-[var(--border-primary)] rounded-2xl text-[var(--text-secondary)] font-bold text-sm flex items-center justify-center gap-2 hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary-light)] hover:bg-[var(--bg-interactive-hover)] transition-all"
                                >
                                    <Plus size={18} />
                                    <span>{t('profile.addCustomCategory')}</span>
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const VoiceCommandGuide = () => {
    const { t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);

    const CommandExample: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <li className="bg-[var(--bg-primary)] px-4 py-3 rounded-lg text-[var(--text-primary)] font-medium text-sm border border-[var(--border-primary)] shadow-sm">
            "{children}"
        </li>
    );

    return (
        <div className="bg-[var(--bg-secondary)] p-1 rounded-3xl border border-[var(--border-primary-translucent)] shadow-sm">
            <div onClick={() => setIsExpanded(!isExpanded)} className="w-full flex justify-between items-center p-5 rounded-2xl hover:bg-[var(--bg-interactive-hover)] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--accent-primary-light)]">
                        <Voicemail size={20} />
                    </div>
                    <h2 className="font-bold text-[var(--text-primary)] text-lg">{t('profile.voiceCommandGuide')}</h2>
                </div>
                {isExpanded ? <ChevronUp size={20} className="text-[var(--text-secondary)]" /> : <ChevronDown size={20} className="text-[var(--text-secondary)]" />}
            </div>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 pt-0 space-y-6">
                            <div>
                                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">{t('voiceCommands.createTitle')}</h3>
                                <ul className="space-y-2">
                                    <CommandExample>{t('voiceCommands.createExample1')}</CommandExample>
                                    <CommandExample>{t('voiceCommands.createExample2')}</CommandExample>
                                    <CommandExample>{t('voiceCommands.createExample3')}</CommandExample>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">{t('voiceCommands.editTitle')}</h3>
                                <ul className="space-y-2">
                                    <CommandExample>{t('voiceCommands.editExample1')}</CommandExample>
                                    <CommandExample>{t('voiceCommands.editExample2')}</CommandExample>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">{t('voiceCommands.filterTitle')}</h3>
                                <ul className="space-y-2">
                                    <CommandExample>{t('voiceCommands.filterExample1')}</CommandExample>
                                    <CommandExample>{t('voiceCommands.filterExample2')}</CommandExample>
                                    <CommandExample>{t('voiceCommands.filterExample3')}</CommandExample>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">{t('voiceCommands.opsTitle')}</h3>
                                <ul className="space-y-2">
                                    <CommandExample>{t('voiceCommands.opsExample1')}</CommandExample>
                                    <CommandExample>{t('voiceCommands.opsExample2')}</CommandExample>
                                    <CommandExample>{t('voiceCommands.opsExample3')}</CommandExample>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">{t('voiceCommands.settingsTitle')}</h3>
                                <ul className="space-y-2">
                                    <CommandExample>{t('voiceCommands.settingsExample1')}</CommandExample>
                                    <CommandExample>{t('voiceCommands.settingsExample2')}</CommandExample>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TeamManager = () => {
    // This component is now merged into OrganizationSettings
    return null;
}

interface AccountModalProps {
    user: User | null;
    onClose: () => void;
    onSave: (name: string, avatarUrl: string) => void;
    isTeamMember?: boolean;
}

const AccountModal: React.FC<AccountModalProps> = ({ user, onClose, onSave, isTeamMember }) => {
    const { t } = useLanguage();
    const [name, setName] = useState(user?.name || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            HapticService.impactLight();
            const base64 = await blobToBase64(file);
            setAvatarUrl(`data:image/jpeg;base64,${base64}`);
            HapticService.notificationSuccess();
        }
    };

    const handleCameraCapture = async (blob: Blob) => {
        HapticService.impactMedium();
        const base64 = await blobToBase64(blob);
        setAvatarUrl(`data:image/jpeg;base64,${base64}`);
        setIsCameraOpen(false);
        HapticService.notificationSuccess();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <AnimatePresence>
                {isCameraOpen && (
                     <motion.div className="fixed inset-0 z-[60] bg-black" onClick={(e) => e.stopPropagation()}>
                        <CameraCapture onCapture={handleCameraCapture} onCancel={() => setIsCameraOpen(false)} />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full max-w-md bg-[var(--bg-secondary)] rounded-3xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-[var(--border-primary)] flex justify-between items-center">
                     <h2 className="text-xl font-bold text-[var(--text-white)]">{t('profile.editProfileTitle')}</h2>
                     <button onClick={onClose}><X className="text-[var(--text-secondary)]" /></button>
                </div>
                <div className="p-8 space-y-6">
                    <div className="flex justify-center">
                        <div className="relative group">
                             <img src={avatarUrl} className="w-32 h-32 rounded-full object-cover border-4 border-[var(--bg-tertiary)] shadow-lg" />
                             <div className="absolute bottom-0 right-0 flex gap-2">
                                <button onClick={() => setIsCameraOpen(true)} className="p-2.5 bg-[var(--accent-primary)] text-white rounded-full hover:scale-110 transition-transform shadow-md"><Camera size={16}/></button>
                                <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-full hover:scale-110 transition-transform shadow-md"><Upload size={16}/></button>
                             </div>
                             <input type="file" ref={fileInputRef} onChange={handleFileUpload} hidden accept="image/*" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 ml-1 uppercase tracking-widest">{t('profile.fullName')}</label>
                        <input 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full bg-[var(--bg-primary)] p-4 rounded-xl text-[var(--text-primary)] outline-none ring-1 ring-transparent focus:ring-[var(--accent-primary)] transition-all" 
                            placeholder={t('profile.fullNamePlaceholder')}
                        />
                    </div>
                    
                    <button 
                        onClick={() => onSave(name, avatarUrl)} 
                        className="w-full py-4 bg-[var(--accent-primary)] text-white font-bold rounded-xl hover:brightness-110 shadow-lg active:scale-95 transition-all"
                    >
                        {t('transactionForm.saveChanges')}
                    </button>
                </div>
            </div>
        </div>
    );
}

const ThemeChip: React.FC<{ label: string, icon: React.ElementType, active: boolean, onClick: () => void }> = ({ label, icon: Icon, active, onClick }) => (
    <button
        onClick={() => {
            HapticService.impactLight();
            onClick();
        }}
        className={`p-4 rounded-2xl text-center transition-all duration-200 flex flex-col items-center justify-center gap-3 ${active ? 'bg-[var(--accent-primary)] text-[var(--text-contrast)] shadow-lg scale-105' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}
    >
        <Icon size={24} />
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </button>
);

export default Profile;
