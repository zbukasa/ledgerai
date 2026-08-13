
import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, Business, UserRole, SubscriptionTier, UsageStats, Feature } from '../types';
import { getBusiness, getUsers, saveBusiness as saveBusinessToStorage, saveUsers as saveUsersToStorage, defaultBusiness, defaultUsers } from '../services/storageService';
import { useNotification } from './NotificationContext';
import { useLanguage } from './LanguageContext';
import { apiService } from '../services/apiService';

interface AuthContextType {
    currentUser: User | null;
    users: User[];
    business: Business | null;
    isPersonalMode: boolean;
    activeBusinessId: string | null;
    setPersonalMode: (isPersonal: boolean) => void;
    login: (userOrId: string | User) => void;
    logout: () => void;
    updateUser: (userId: string, data: Partial<User>) => void;
    addUser: (userOrName: string | User, role?: UserRole) => void;
    deleteUser: (userId: string) => void;
    updateBusiness: (data: Partial<Business>) => void;
    createBusiness: (name: string, type?: string, description?: string) => Business;
    joinBusiness: (inviteCode: string) => Promise<boolean>;
    leaveBusiness: () => void;
    getUserById: (userId: string) => User | undefined;
    incrementUsage: (metric: keyof Omit<UsageStats, 'lastResetMonth'>) => void;
    checkLimit: (metric: keyof Omit<UsageStats, 'lastResetMonth'>) => { reached: boolean; limit: number; current: number };
    hasFeature: (feature: Feature) => boolean;
    upgradeTier: (tier: SubscriptionTier) => void;
    applyPromoCode: (code: string) => Promise<boolean>;
    acceptTerms: () => void;
    isTrialActive: boolean;
    trialDaysLeft: number;
    startTrial: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [business, setBusiness] = useState<Business | null>(null);
    const [isPersonalMode, setIsPersonalMode] = useState<boolean>(() => {
        return localStorage.getItem('isPersonalMode') === 'true';
    });

    const isTrialActive = useMemo(() => {
        const tier = isPersonalMode ? (currentUser?.tier || 'free') : (business?.tier || 'free');
        // Trial only applies if the active context is on the free tier
        if (tier !== 'free') return false;
        // User must have explicitly started a trial and not already exhausted it
        if (!currentUser?.trialStartedAt || !currentUser?.hasUsedTrial) return false;
        
        const start = new Date(currentUser.trialStartedAt);
        const now = new Date();
        const diffTime = now.getTime() - start.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);
        
        // Trial lasts exactly 7 days from the moment it started
        return diffDays >= 0 && diffDays <= 7;
    }, [currentUser?.trialStartedAt, currentUser?.hasUsedTrial, currentUser?.tier, business?.tier, isPersonalMode]);

    const trialDaysLeft = useMemo(() => {
        const tier = isPersonalMode ? (currentUser?.tier || 'free') : (business?.tier || 'free');
        if (tier !== 'free' || !currentUser?.trialStartedAt || !currentUser?.hasUsedTrial) return 0;
        
        const start = new Date(currentUser.trialStartedAt);
        const now = new Date();
        const diffTime = now.getTime() - start.getTime();
        const diffDays = Math.ceil(7 - (diffTime / (1000 * 3600 * 24)));
        
        return Math.max(0, diffDays);
    }, [currentUser?.trialStartedAt, currentUser?.hasUsedTrial, currentUser?.tier, business?.tier, isPersonalMode]);

    const startTrial = () => {
        if (currentUser && !currentUser.trialStartedAt && !currentUser.hasUsedTrial) {
            // Set both flags to ensure it can never be restarted
            updateUser(currentUser.id, { 
                trialStartedAt: new Date().toISOString(),
                hasUsedTrial: true 
            });
            addToast("7-Day Premium Trial Started!", "success");
        } else {
            addToast("Trial already used or active.", "info");
        }
    };

    const { addToast } = useNotification();
    const { t } = useLanguage();

    useEffect(() => {
        const loadInitialData = async () => {
            // Load business
            let loadedBusiness = await getBusiness() || defaultBusiness;
            
            // Ensure business has an invite code and admin
            let needsUpdate = false;
            if (!loadedBusiness.inviteCode) {
                loadedBusiness.inviteCode = generateInviteCode();
                needsUpdate = true;
            }
            if (!loadedBusiness.adminId && currentUser) {
                loadedBusiness.adminId = currentUser.id;
                needsUpdate = true;
            } else if (!loadedBusiness.adminId && !currentUser) {
                // Fallback to first user if no current user yet (initial load)
                const loadedUsers = await getUsers() || defaultUsers;
                if (loadedUsers.length > 0) {
                    loadedBusiness.adminId = loadedUsers[0].id;
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                await saveBusinessToStorage(loadedBusiness);
            }
            
            setBusiness(loadedBusiness);

            // Load users
            const loadedUsers = await getUsers() || defaultUsers;
            setUsers(loadedUsers);

            // Check for a logged-in user session
            const sessionUserId = sessionStorage.getItem('currentUserId');
            if (sessionUserId) {
                const user = loadedUsers.find((u: User) => u.id === sessionUserId);
                if(user) {
                    setCurrentUser(user);
                    // Ensure backend token is present
                    if (!apiService.auth.isAuthenticated()) {
                        apiService.auth.login(user.name, 'password').catch(console.error);
                    }
                }
            }
        };

        loadInitialData();
    }, []);

    const saveUsers = async (newUsers: User[]) => {
        setUsers(newUsers);
        await saveUsersToStorage(newUsers);
    };
    
    const saveBusiness = async (newBusiness: Business) => {
        setBusiness(newBusiness);
        await saveBusinessToStorage(newBusiness);
    }

    const login = (userOrId: string | User) => {
        let userToLogin: User | undefined;

        if (typeof userOrId === 'string') {
            userToLogin = users.find(u => u.id === userOrId);
        } else {
            userToLogin = userOrId;
        }

        if (userToLogin) {
            setCurrentUser(userToLogin);
            sessionStorage.setItem('currentUserId', userToLogin.id);
            // Sync with backend
            apiService.auth.login(userToLogin.name, 'password').catch(console.error);
        } else {
            console.error("User not found in list", typeof userOrId === 'string' ? userOrId : userOrId.id);
        }
    };

    const logout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('currentUserId');
    };

    const updateUser = (userId: string, data: Partial<User>) => {
        const newUsers = users.map(u => u.id === userId ? { ...u, ...data } : u);
        saveUsers(newUsers);
        if(currentUser?.id === userId) {
            const updatedCurrentUser = newUsers.find(u => u.id === userId);
            if(updatedCurrentUser) setCurrentUser(updatedCurrentUser);
        }
        
        window.dispatchEvent(new CustomEvent('log-activity-request', {
            detail: { type: 'business', action: 'update', details: `Updated user: ${data.name || userId}` }
        }));
        
        addToast(t('notifications.userUpdated'), "success");
    };

    // Overloaded addUser to support both legacy (name, role) and new (full User object)
    const addUser = (userOrName: string | User, role: UserRole = 'Manager') => {
        let newUser: User;

        if (typeof userOrName === 'string') {
            newUser = {
                id: uuidv4(),
                name: userOrName,
                role,
                avatarUrl: `https://i.pravatar.cc/150?u=${uuidv4()}`
            };
        } else {
            newUser = userOrName;
        }

        const updatedUsers = [...users, newUser];
        saveUsers(updatedUsers);
        // Note: Don't show toast for onboarding registration, strictly speaking, but keeping consistent behavior is fine.
        // If we want to suppress toast for onboarding, we'd need a flag.
    };

    const deleteUser = (userId: string) => {
        if (currentUser?.id === userId) {
            addToast(t('notifications.cannotDeleteSelf'), "error");
            return;
        }
        if (window.confirm(t('profile.deleteUserConfirmation'))) {
            saveUsers(users.filter(u => u.id !== userId));
            addToast(t('notifications.userDeleted'), "success");
        }
    };
    
    const updateBusiness = (data: Partial<Business>) => {
        if(business) {
            const newBusiness = { ...business, ...data };
            saveBusiness(newBusiness);
            
            window.dispatchEvent(new CustomEvent('log-activity-request', {
                detail: { type: 'business', action: 'update', details: `Updated organization settings: ${Object.keys(data).join(', ')}` }
            }));
            
            addToast(t('notifications.businessUpdated'), "success");
        }
    };

    const generateInviteCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const createBusiness = (name: string, type?: string, description?: string) => {
        const newBusiness: Business = {
            id: uuidv4(),
            name,
            businessType: type,
            description,
            inviteCode: generateInviteCode(),
            adminId: currentUser?.id,
            settings: {
                restrictIncomeVisibility: true
            }
        };
        saveBusiness(newBusiness);
        return newBusiness;
    };

    const joinBusiness = async (inviteCode: string): Promise<boolean> => {
        // In a real app, this would verify with a backend.
        // For this demo, we'll simulate a successful join if the code is 6 chars.
        if (inviteCode.length === 6) {
            // Mocking finding a business by code
            const mockBusiness: Business = {
                id: uuidv4(),
                name: "Joined Organization",
                businessType: "Shared",
                inviteCode: inviteCode,
                adminId: 'user-1', // Mock admin
                settings: {
                    restrictIncomeVisibility: true
                }
            };
            saveBusiness(mockBusiness);
            
            // Update current user's businessId
            if (currentUser) {
                updateUser(currentUser.id, { businessId: mockBusiness.id });
            }
            
            setPersonalMode(false); // Automatically switch to org mode on join
            addToast(t('profile.joinSuccess'), "success");
            return true;
        }
        addToast(t('profile.invalidInviteCode'), "error");
        return false;
    };

    const setPersonalMode = (isPersonal: boolean) => {
        setIsPersonalMode(isPersonal);
        localStorage.setItem('isPersonalMode', isPersonal.toString());
        addToast(isPersonal ? t('notifications.switchedToPersonal') : t('notifications.switchedToOrg'), "info");
    };

    const leaveBusiness = async () => {
        try {
            // Removing window.confirm as it might be blocked in the iframe
            await saveBusiness(defaultBusiness);
            
            if (currentUser) {
                const updatedUsers = users.map(u => 
                    u.id === currentUser.id ? { ...u, businessId: undefined } : u
                );
                await saveUsers(updatedUsers);
                
                const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
                if (updatedCurrentUser) setCurrentUser(updatedCurrentUser);
            }
            
            setPersonalMode(true);
            addToast(t('profile.leaveOrgSuccess'), "success");
        } catch (error) {
            console.error("Error leaving business:", error);
            addToast(t('notifications.leaveOrgError'), "error");
        }
    };
    
    const getUserById = (userId: string) => users.find(u => u.id === userId);
    
    const getUsageLimit = (metric: keyof Omit<UsageStats, 'lastResetMonth'>, tier: SubscriptionTier = 'free'): number => {
        const limits = {
            free: { voiceCommands: 10, aiInsights: 5, receiptScans: 5 },
            premium: { voiceCommands: 1000, aiInsights: 1000, receiptScans: 1000 },
            enterprise: { voiceCommands: 10000, aiInsights: 10000, receiptScans: 10000 }
        };
        return limits[tier][metric];
    };

    const hasFeature = (feature: Feature): boolean => {
        const baseTier = isPersonalMode ? (currentUser?.tier || 'free') : (business?.tier || 'free');
        const promoActive = currentUser?.promoIsActive || false;
        
        // Parse features if they exist
        let promoFeatures: string[] = [];
        if (promoActive && currentUser?.features) {
            try {
                promoFeatures = typeof currentUser.features === 'string' 
                    ? JSON.parse(currentUser.features) 
                    : currentUser.features;
            } catch (e) {
                console.error("Error parsing promo features", e);
            }
        }

        // Feature mapping for promo codes
        const promoFeatureMap: Record<string, Feature[]> = {
            'ad-free': ['NO_ADS'],
            'unlimited-scans': ['OCR_UNLIMITED'],
            'advanced-analytics': ['INSIGHTS_UNLIMITED', 'ADVANCED_EXPORT']
        };

        // Check if feature is granted by promo
        const isGrantedByPromo = promoFeatures.some(pf => 
            promoFeatureMap[pf]?.includes(feature)
        );

        if (isGrantedByPromo) return true;
        
        // If trial is active and they are on free, give them premium features
        let tier = baseTier;
        if ((isTrialActive || promoActive) && tier === 'free') {
            tier = 'premium';
        }
        
        switch (feature) {
            case 'VOICE_UNLIMITED':
            case 'INSIGHTS_UNLIMITED':
            case 'OCR_UNLIMITED':
            case 'ADVANCED_EXPORT':
            case 'INVENTORY':
            case 'BATCH_MANAGEMENT':
            case 'NO_ADS':
            case 'CLOUD_BACKUP':
            case 'BANK_SYNC':
            case 'RECURRING_TRIPS':
                return tier === 'premium' || tier === 'enterprise';
            case 'AI_INSIGHTS':
            case 'VEHICLE_TRACKING':
            case 'TRIP_TRACKER':
                return true; // Available on all tiers but limited on free for AI_INSIGHTS
            case 'MULTI_USER':
            case 'RBAC':
            case 'AUDIT_LOGS':
                return tier === 'enterprise';
            default:
                return false;
        }
    };

    const checkLimit = (metric: keyof Omit<UsageStats, 'lastResetMonth'>) => {
        const tier = isPersonalMode ? (currentUser?.tier || 'free') : (business?.tier || 'free');
        
        // If they have unlimited feature for this metric, never reached
        if (metric === 'voiceCommands' && hasFeature('VOICE_UNLIMITED')) return { reached: false, limit: Infinity, current: 0 };
        if (metric === 'aiInsights' && hasFeature('INSIGHTS_UNLIMITED')) return { reached: false, limit: Infinity, current: 0 };
        if (metric === 'receiptScans' && hasFeature('OCR_UNLIMITED')) return { reached: false, limit: Infinity, current: 0 };

        const currentUsage = currentUser?.usage?.[metric] || 0;
        const limit = getUsageLimit(metric, tier);
        
        return {
            reached: currentUsage >= limit,
            limit,
            current: currentUsage
        };
    };

    const incrementUsage = (metric: keyof Omit<UsageStats, 'lastResetMonth'>) => {
        if (!currentUser) return;
        
        const currentMonth = new Date().toISOString().slice(0, 7);
        const currentUsage = currentUser.usage || { voiceCommands: 0, aiInsights: 0, receiptScans: 0, lastResetMonth: currentMonth };
        
        // Reset if new month
        let updatedUsage = { ...currentUsage };
        if (updatedUsage.lastResetMonth !== currentMonth) {
            updatedUsage = { voiceCommands: 0, aiInsights: 0, receiptScans: 0, lastResetMonth: currentMonth };
        }
        
        updatedUsage[metric] += 1;
        updateUser(currentUser.id, { usage: updatedUsage });
    };

    const upgradeTier = (tier: SubscriptionTier) => {
        if (isPersonalMode && currentUser) {
            updateUser(currentUser.id, { 
                tier,
                hasUsedTrial: true // Upgrading to a paid tier counts as having used the trial opportunity
            });
        } else if (!isPersonalMode && business) {
            updateBusiness({ tier });
            // Also mark the current user as having used their trial if they are the one upgrading the business
            if (currentUser) {
                updateUser(currentUser.id, { hasUsedTrial: true });
            }
        }
        addToast(t('notifications.upgradeSuccess', { tier: tier.toUpperCase() }), "success");
    };

    const applyPromoCode = async (code: string): Promise<boolean> => {
        if (!currentUser) return false;
        try {
            const result = await apiService.promo.apply(code);
            if (result.success) {
                updateUser(currentUser.id, result.user);
                addToast(`Promo activated! You have ${result.user.promoExpiresAt ? Math.ceil((new Date(result.user.promoExpiresAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 'X'} days of premium access.`, "success");
                return true;
            }
            return false;
        } catch (error: any) {
            addToast(error.message || "Failed to apply promo code", "error");
            return false;
        }
    };

    const acceptTerms = () => {
        if (currentUser) {
            updateUser(currentUser.id, { hasAcceptedTerms: true });
        }
    };

    const activeBusinessId = isPersonalMode ? 'personal' : (business?.id || null);

    const value = {
        currentUser, users, business, isPersonalMode, activeBusinessId, setPersonalMode, login, logout, 
        updateUser, addUser, deleteUser, updateBusiness, createBusiness, joinBusiness, leaveBusiness, getUserById,
        incrementUsage, checkLimit, hasFeature, upgradeTier, applyPromoCode, acceptTerms, isTrialActive, trialDaysLeft, startTrial
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
