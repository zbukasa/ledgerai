
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Square, Play, MapPin, Gauge } from 'lucide-react';
import { useTrip } from '../contexts/TripContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { convertDistance } from '../utils/helpers';
import { Trip, DistanceUnit } from '../types';
import { HapticService } from '../services/hapticService';

interface TripTrackerProps {
    onTripEnd?: (trip: Trip) => void;
}

const TripTracker: React.FC<TripTrackerProps> = ({ onTripEnd }) => {
    const { activeTrip, startTrip, stopTrip } = useTrip();
    const { t } = useLanguage();
    const { currentUser, business, isPersonalMode } = useAuth();
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const distanceUnit: DistanceUnit = (isPersonalMode ? currentUser?.distanceUnit : business?.settings?.distanceUnit) || 'km';

    useEffect(() => {
        if (activeTrip?.isActive) {
            timerRef.current = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - activeTrip.startTime) / 1000));
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setElapsedTime(0);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [activeTrip?.isActive, activeTrip?.startTime]);

    const handleStart = () => {
        HapticService.impactMedium();
        // Default to business for now, or we could show a small selector
        startTrip('business');
    };

    const handleStop = () => {
        HapticService.notificationSuccess();
        const finishedTrip = stopTrip();
        if (finishedTrip && onTripEnd) {
            onTripEnd(finishedTrip);
        }
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <motion.div 
            drag
            dragMomentum={false}
            className="relative pointer-events-auto cursor-grab active:cursor-grabbing"
        >
            <AnimatePresence mode="wait">
                {!activeTrip?.isActive ? (
                    <motion.button
                        key="start-btn"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={handleStart}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent-primary)] text-white rounded-xl font-bold shadow-lg shadow-[var(--accent-primary)]/20 hover:brightness-110 transition-all active:scale-95"
                    >
                        <Navigation size={18} className="rotate-45" />
                        <span>{t('trip.startTrip')}</span>
                    </motion.button>
                ) : (
                    <motion.div
                        key="active-trip"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="bg-[var(--bg-secondary)] border border-[var(--accent-primary)]/40 rounded-xl p-2.5 shadow-xl flex items-center gap-3 min-w-[200px] backdrop-blur-md"
                    >
                        <div className="w-9 h-9 rounded-full bg-[var(--accent-primary)]/15 flex items-center justify-center text-[var(--accent-primary-light)] shrink-0 border-2 border-[var(--positive-text)] shadow-[0_0_10px_var(--positive-bg-translucent)]">
                            <Navigation size={18} className="rotate-45" />
                        </div>
                        
                        <div className="flex-grow">
                            <div className="flex items-center justify-between mb-0.5">
                                <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--accent-primary-light)]">
                                    {t('vehicle.totalDistance')}
                                </span>
                                <span className="text-[9px] font-mono text-[var(--text-tertiary)] opacity-80">{formatTime(elapsedTime)}</span>
                            </div>
                            <div className="flex items-end gap-1">
                                <span className="text-xl font-bold text-[var(--text-white)] leading-none">
                                    {(distanceUnit === 'km' ? activeTrip.distance : convertDistance(activeTrip.distance, 'km', 'miles')).toFixed(1)}
                                </span>
                                <span className="text-[10px] font-bold text-[var(--text-secondary)] mb-0.5">{distanceUnit.toUpperCase()}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleStop}
                            className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90 shrink-0"
                            title={t('trip.stopTrip')}
                        >
                            <Square size={14} fill="currentColor" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default TripTracker;
