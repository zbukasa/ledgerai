
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../services/syncService';
import { Activity, User } from '../types';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { realtimeService } from '../services/realtimeService';
import { v4 as uuidv4 } from 'uuid';

interface ActivityContextType {
    activities: Activity[];
    logActivity: (activity: Omit<Activity, 'id' | 'timestamp' | 'userId' | 'userName' | 'businessId'>) => Promise<void>;
    searchActivities: (query: string, filters?: { userId?: string, action?: string, type?: string, startDate?: number, endDate?: number }) => Promise<Activity[]>;
    isLoading: boolean;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { currentUser, business } = useAuth();
    const { addToast } = useNotification();

    const loadActivities = useCallback(async () => {
        if (!currentUser?.businessId) return;
        try {
            const all = await db.activities
                .where('businessId')
                .equals(currentUser.businessId)
                .reverse()
                .sortBy('timestamp');
            setActivities(all);
        } catch (error) {
            console.error('Error loading activities:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        loadActivities();
    }, [loadActivities]);

    const logActivity = useCallback(async (activityData: Omit<Activity, 'id' | 'timestamp' | 'userId' | 'userName' | 'businessId'>) => {
        if (!currentUser) return;

        const activity: Activity = {
            ...activityData,
            id: uuidv4(),
            timestamp: Date.now(),
            userId: currentUser.id,
            userName: currentUser.name,
            businessId: currentUser.businessId
        };

        try {
            await db.activities.add(activity);
            setActivities(prev => [activity, ...prev].slice(0, 100));
            
            // Broadcast
            if (currentUser.businessId) {
                realtimeService.broadcast('activity', { activity }, currentUser.businessId);
            }
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }, [currentUser]);

    const searchActivities = useCallback(async (query: string, filters?: { userId?: string, action?: string, type?: string, startDate?: number, endDate?: number }) => {
        if (!currentUser?.businessId) return [];

        try {
            let collection = db.activities.where('businessId').equals(currentUser.businessId);

            let results = await collection.reverse().sortBy('timestamp');

            if (query) {
                const lowerQuery = query.toLowerCase();
                results = results.filter(a => 
                    a.details.toLowerCase().includes(lowerQuery) || 
                    a.userName.toLowerCase().includes(lowerQuery)
                );
            }

            if (filters) {
                if (filters.userId) results = results.filter(a => a.userId === filters.userId);
                if (filters.action) results = results.filter(a => a.action === filters.action);
                if (filters.type) results = results.filter(a => a.type === filters.type);
                if (filters.startDate) results = results.filter(a => a.timestamp >= filters.startDate!);
                if (filters.endDate) results = results.filter(a => a.timestamp <= filters.endDate!);
            }

            return results;
        } catch (error) {
            console.error('Error searching activities:', error);
            return [];
        }
    }, [currentUser]);

    useEffect(() => {
        const handleSync = (e: any) => {
            const { type, activity } = e.detail;
            
            if (activity) {
                // Save to local DB
                db.activities.put(activity);
                setActivities(prev => [activity, ...prev].slice(0, 100));

                // Notify if Admin and not the one who did it
                const isAdmin = currentUser?.role === 'Admin' || (business?.adminId === currentUser?.id);
                if (isAdmin && activity.userId !== currentUser?.id) {
                    addToast(`${activity.userName}: ${activity.details}`, 'info');
                }
            } else if (type === 'activity') {
                loadActivities();
            }
        };

        const handleLogRequest = (e: any) => {
            const { type, action, details } = e.detail;
            logActivity({ type, action, details });
        };

        window.addEventListener('realtime-sync', handleSync);
        window.addEventListener('log-activity-request', handleLogRequest);
        return () => {
            window.removeEventListener('realtime-sync', handleSync);
            window.removeEventListener('log-activity-request', handleLogRequest);
        };
    }, [currentUser, business, addToast, loadActivities, logActivity]);

    return (
        <ActivityContext.Provider value={{ activities, logActivity, searchActivities, isLoading }}>
            {children}
        </ActivityContext.Provider>
    );
};

export const useActivity = () => {
    const context = useContext(ActivityContext);
    if (context === undefined) {
        throw new Error('useActivity must be used within an ActivityProvider');
    }
    return context;
};
