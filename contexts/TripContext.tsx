
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Trip, UsageType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { dataService } from '../services/dataService';
import { db } from '../services/syncService';

interface TripContextType {
    activeTrip: Trip | null;
    historicalTrips: Trip[];
    startTrip: (usageType: UsageType) => void;
    stopTrip: () => Trip | null;
    deleteTrip: (id: string) => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
    const [historicalTrips, setHistoricalTrips] = useState<Trip[]>([]);
    const watchIdRef = useRef<number | null>(null);
    const { addToast } = useNotification();
    const { currentUser, activeBusinessId } = useAuth();
    const { t } = useLanguage();

    useEffect(() => {
        const loadTrips = async () => {
            if (currentUser) {
                const trips = await db.trips
                    .where('userId')
                    .equals(currentUser.id)
                    .reverse()
                    .toArray();
                setHistoricalTrips(trips);
            }
        };
        loadTrips();
    }, [currentUser]);

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    const startTrip = (usageType: UsageType) => {
        if (activeTrip || !currentUser) return;

        if (!navigator.geolocation) {
            addToast(t('notifications.geoNotSupported'), "error");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const newTrip: Trip = {
                    id: uuidv4(),
                    startTime: Date.now(),
                    startLocation: { lat: latitude, lng: longitude },
                    currentLocation: { lat: latitude, lng: longitude },
                    distance: 0,
                    isActive: true,
                    usageType,
                    userId: currentUser.id,
                    businessId: activeBusinessId || undefined
                };
                setActiveTrip(newTrip);
                dataService.saveTrip(newTrip);

                watchIdRef.current = navigator.geolocation.watchPosition(
                    (pos) => {
                        const { latitude: newLat, longitude: newLon } = pos.coords;
                        setActiveTrip(prev => {
                            if (!prev) return null;
                            const d = calculateDistance(
                                prev.currentLocation?.lat || prev.startLocation?.lat || newLat,
                                prev.currentLocation?.lng || prev.startLocation?.lng || newLon,
                                newLat,
                                newLon
                            );
                            // Filter out jitter (less than 5 meters)
                            const addedDistance = d > 0.005 ? d : 0;
                            const updated = {
                                ...prev,
                                currentLocation: { lat: newLat, lng: newLon },
                                distance: prev.distance + addedDistance
                            };
                            // Periodically save progress? For now just keep in memory for performance
                            return updated;
                        });
                    },
                    (err) => console.error("Watch position error:", err),
                    { enableHighAccuracy: true }
                );
            },
            (err) => {
                addToast(t('notifications.geoPermissionError'), "error");
                console.error("Geolocation error:", err);
            }
        );
    };

    const stopTrip = () => {
        const finalTrip = activeTrip;
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setActiveTrip(null);
        if (finalTrip) {
            const completedTrip: Trip = {
                ...finalTrip,
                isActive: false,
                endTime: Date.now(),
                endLocation: finalTrip.currentLocation
            };
            dataService.saveTrip(completedTrip);
            setHistoricalTrips(prev => [completedTrip, ...prev]);
            addToast(t('notifications.tripStopped'), "info");
            return completedTrip;
        }
        return null;
    };

    const deleteTrip = async (id: string) => {
        try {
            await dataService.deleteTrip(id);
            setHistoricalTrips(prev => prev.filter(t => t.id !== id));
            addToast(t('notifications.tripDeleted'), "success");
        } catch (error) {
            addToast(t('notifications.tripDeleteError'), "error");
        }
    };

    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    return (
        <TripContext.Provider value={{ activeTrip, historicalTrips, startTrip, stopTrip, deleteTrip }}>
            {children}
        </TripContext.Provider>
    );
};

export const useTrip = () => {
    const context = useContext(TripContext);
    if (context === undefined) {
        throw new Error('useTrip must be used within a TripProvider');
    }
    return context;
};
