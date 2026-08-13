import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar as CalendarIcon, Save, Trash2, Check, Info, Calculator, TrendingUp } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/dataService';
import { db } from '../services/syncService';
import { SavedRoute, RecurringTrip, Transaction, UsageType, DistanceUnit, Trip } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { convertDistance } from '../utils/helpers';
import { apiService } from '../services/apiService';

interface RecurringTripModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (count: number, totalKm: number) => void;
    activeBusinessId: string;
}

const RecurringTripModal: React.FC<RecurringTripModalProps> = ({ isOpen, onClose, onSuccess, activeBusinessId }) => {
    const { t } = useLanguage();
    const { currentUser, business, isPersonalMode } = useAuth();
    const { preferredCurrency } = useCurrency();
    
    const distanceUnit: DistanceUnit = (isPersonalMode ? currentUser?.distanceUnit : business?.settings?.distanceUnit) || 'km';
    
    const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
    const [selectedRouteId, setSelectedRouteId] = useState<string>('');
    const [isCreatingRoute, setIsCreatingRoute] = useState(false);
    
    // New Route Form
    const [routeName, setRouteName] = useState('');
    const [fromLoc, setFromLoc] = useState('');
    const [toLoc, setToLoc] = useState('');
    const [distance, setDistance] = useState<number>(0);
    
    // Trip Selection
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [usageType, setUsageType] = useState<UsageType>('business');
    const [multiplier, setMultiplier] = useState<number>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Google Maps Integration
    const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
    const [toSuggestions, setToSuggestions] = useState<any[]>([]);
    const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
    const [showFromSuggestions, setShowFromSuggestions] = useState(false);
    const [showToSuggestions, setShowToSuggestions] = useState(false);
    const fromRef = useRef<HTMLDivElement>(null);
    const toRef = useRef<HTMLDivElement>(null);

    // Click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
                setShowFromSuggestions(false);
            }
            if (toRef.current && !toRef.current.contains(event.target as Node)) {
                setShowToSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced autocomplete for From
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (fromLoc.length >= 3 && showFromSuggestions) {
                try {
                    const data = await apiService.maps.autocomplete(fromLoc);
                    setFromSuggestions(data.predictions || []);
                } catch (e) {
                    console.error(e);
                }
            } else {
                setFromSuggestions([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [fromLoc, showFromSuggestions]);

    // Debounced autocomplete for To
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (toLoc.length >= 3 && showToSuggestions) {
                try {
                    const data = await apiService.maps.autocomplete(toLoc);
                    setToSuggestions(data.predictions || []);
                } catch (e) {
                    console.error(e);
                }
            } else {
                setToSuggestions([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [toLoc, showToSuggestions]);

    // Auto-calculate distance when both locations are selected
    useEffect(() => {
        if (fromLoc && toLoc && !isCreatingRoute && !isCalculatingDistance) {
            // This is just a helper, distance can still be manual
        }
    }, [fromLoc, toLoc]);

    const handleCalculateDistance = async () => {
        if (!fromLoc || !toLoc) return;
        setIsCalculatingDistance(true);
        try {
            const data = await apiService.maps.calculateDistance(fromLoc, toLoc);
            if (data.rows?.[0]?.elements?.[0]?.distance?.value) {
                const km = data.rows[0].elements[0].distance.value / 1000;
                // If user is in miles mode, we should show them miles in the input
                const displayDistance = distanceUnit === 'km' ? km : convertDistance(km, 'km', 'miles');
                setDistance(parseFloat(displayDistance.toFixed(1)));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsCalculatingDistance(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadRoutes();
        }
    }, [isOpen]);

    const loadRoutes = async () => {
        const routes = await db.savedRoutes.where('userId').equals(currentUser?.id || '').toArray();
        setSavedRoutes(routes);
        if (routes.length > 0 && !selectedRouteId) {
            setSelectedRouteId(routes[0].id);
        }
    };

    const handleSaveRoute = async () => {
        if (!routeName || !fromLoc || !toLoc || distance <= 0) return;
        
        // Convert distance to KM for storage if currently in miles
        const kmDistance = distanceUnit === 'km' ? distance : convertDistance(distance, 'miles', 'km');

        const newRoute: SavedRoute = {
            id: uuidv4(),
            name: routeName,
            from: fromLoc,
            to: toLoc,
            distance: kmDistance,
            userId: currentUser?.id || ''
        };
        
        await dataService.saveRoute(newRoute);
        await loadRoutes();
        setSelectedRouteId(newRoute.id);
        setIsCreatingRoute(false);
        setRouteName('');
        setFromLoc('');
        setToLoc('');
        setDistance(0);
    };

    const handleDeleteRoute = async (id: string) => {
        await dataService.deleteRoute(id);
        await loadRoutes();
        if (selectedRouteId === id) {
            setSelectedRouteId('');
        }
    };

    const toggleDate = (date: Date) => {
        setSelectedDates(prev => {
            const exists = prev.find(d => isSameDay(d, date));
            if (exists) {
                return prev.filter(d => !isSameDay(d, date));
            } else {
                return [...prev, date];
            }
        });
    };

    const handleSubmit = async () => {
        if (!selectedRouteId || selectedDates.length === 0) return;
        
        setIsSubmitting(true);
        const route = savedRoutes.find(r => r.id === selectedRouteId);
        if (!route) return;

        try {
            const newTrips: Trip[] = selectedDates.map(date => ({
                id: uuidv4(),
                userId: currentUser?.id || '',
                businessId: activeBusinessId === 'personal' ? undefined : activeBusinessId,
                startTime: date.getTime(),
                endTime: date.getTime(),
                distance: route.distance * multiplier,
                usageType: usageType,
                isActive: false,
                routeName: route.name,
                multiplier: multiplier
            }));

            for (const trip of newTrips) {
                await dataService.saveTrip(trip);
            }

            // Save recurring trip log
            const recurringTrip: RecurringTrip = {
                id: uuidv4(),
                routeId: route.id,
                dates: selectedDates.map(d => d.toISOString()),
                usageType: usageType,
                userId: currentUser?.id || ''
            };
            await dataService.saveRecurringTrip(recurringTrip);

            onSuccess(selectedDates.length, selectedDates.length * route.distance * multiplier);
            onClose();
            setSelectedDates([]);
            setMultiplier(1);
        } catch (error) {
            console.error("Failed to save recurring trips", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedRoute = savedRoutes.find(r => r.id === selectedRouteId);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-[var(--bg-primary)] border border-[var(--border-primary-translucent)] rounded-3xl w-[95vw] md:w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl"
            >
                {/* Header */}
                <div className="p-6 border-b border-[var(--border-primary-translucent)] flex justify-between items-center bg-[var(--bg-secondary)]">
                    <div>
                        <h2 className="text-xl font-black text-[var(--text-white)] tracking-tight flex items-center gap-2">
                            <TrendingUp className="text-[var(--accent-primary)]" size={24} />
                            {t('vehicle.recurringTrips')}
                        </h2>
                        <p className="text-xs text-[var(--text-tertiary)] mt-1">{t('vehicle.recurringTripsDesc')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--bg-tertiary)] rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-48">
                    {/* Usage Type & Multiplier */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <section className="bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border-primary-translucent)] shadow-inner">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">{t('vehicle.usageType')}</h3>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--accent-primary-light)]">
                                    <Info size={12} />
                                    <span>{t('vehicle.usageTypeHint')}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {(['business', 'personal'] as UsageType[]).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setUsageType(type)}
                                        className={`flex-1 py-3 px-4 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${usageType === type ? 'bg-[var(--accent-primary)] text-[var(--text-contrast)] border-[var(--accent-primary)] shadow-lg shadow-[var(--accent-primary)]/20' : 'bg-[var(--bg-tertiary)] border-[var(--border-primary-translucent)] text-[var(--text-tertiary)] hover:border-[var(--text-secondary)]'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${type === 'business' ? 'bg-blue-400' : 'bg-purple-400'} ${usageType === type ? 'ring-2 ring-white' : ''}`} />
                                        {t(`vehicle.${type}`)}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border-primary-translucent)] shadow-inner">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">{t('vehicle.multiplier')}</h3>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--accent-primary-light)]">
                                    <Calculator size={12} />
                                    <span>{t('vehicle.multiplierHint')}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {[1, 2].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setMultiplier(val)}
                                        className={`flex-1 py-3 rounded-xl border font-bold text-xs transition-all ${multiplier === val ? 'bg-[var(--accent-primary)] text-[var(--text-contrast)] border-[var(--accent-primary)]' : 'bg-[var(--bg-tertiary)] border-[var(--border-primary-translucent)] text-[var(--text-tertiary)]'}`}
                                    >
                                        {val === 1 ? t('vehicle.oneWay') : t('vehicle.roundTrip')}
                                    </button>
                                ))}
                                <div className="relative flex-[0.5]">
                                    <input 
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={multiplier}
                                        onChange={(e) => setMultiplier(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-full h-full bg-[var(--bg-tertiary)] border border-[var(--border-primary-translucent)] rounded-xl px-3 text-center text-sm font-bold focus:outline-none focus:border-[var(--accent-primary)]"
                                    />
                                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[var(--bg-secondary)] px-1 text-[8px] font-bold text-[var(--text-tertiary)]">QTY</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Route Selection */}
                    <section className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-tertiary)]">{t('vehicle.selectRoute')}</h3>
                            <button 
                                onClick={() => setIsCreatingRoute(!isCreatingRoute)}
                                className="text-xs font-bold text-[var(--accent-primary)] hover:underline"
                            >
                                {isCreatingRoute ? t('common.cancel') : t('vehicle.addNewRoute')}
                            </button>
                        </div>

                        {isCreatingRoute ? (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--accent-primary)]/30 space-y-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-[var(--text-tertiary)] ml-1">{t('vehicle.routeName')}</label>
                                        <input 
                                            type="text" 
                                            value={routeName}
                                            onChange={(e) => setRouteName(e.target.value)}
                                            placeholder={t('vehicle.routeNamePlaceholder')}
                                            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary-translucent)] rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--accent-primary)]"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-[var(--text-tertiary)] ml-1">{t('vehicle.distance')} ({distanceUnit.toUpperCase()})</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={distance || ''}
                                                onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
                                                placeholder="0.0"
                                                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary-translucent)] rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--accent-primary)]"
                                            />
                                            <Calculator size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1 relative" ref={fromRef}>
                                        <label className="text-[10px] font-bold uppercase text-[var(--text-tertiary)] ml-1">{t('vehicle.from')}</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={fromLoc}
                                                onChange={(e) => {
                                                    setFromLoc(e.target.value);
                                                    setShowFromSuggestions(true);
                                                }}
                                                onFocus={() => setShowFromSuggestions(true)}
                                                placeholder={t('vehicle.startAddressPlaceholder')}
                                                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary-translucent)] rounded-xl p-3 pl-10 text-sm focus:outline-none focus:border-[var(--accent-primary)]"
                                            />
                                            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                                        </div>
                                        <AnimatePresence>
                                            {showFromSuggestions && fromSuggestions.length > 0 && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute z-[110] left-0 right-0 top-full mt-1 bg-[var(--bg-tertiary)] border border-[var(--border-primary-translucent)] rounded-xl shadow-xl max-h-48 overflow-y-auto"
                                                >
                                                    {fromSuggestions.map((s: any) => (
                                                        <button 
                                                            key={s.place_id}
                                                            onClick={() => {
                                                                setFromLoc(s.description);
                                                                setShowFromSuggestions(false);
                                                            }}
                                                            className="w-full text-left p-3 text-xs hover:bg-[var(--bg-secondary)] border-b border-[var(--border-primary-translucent)] last:border-0"
                                                        >
                                                            {s.description}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <div className="space-y-1 relative" ref={toRef}>
                                        <label className="text-[10px] font-bold uppercase text-[var(--text-tertiary)] ml-1">{t('vehicle.to')}</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={toLoc}
                                                onChange={(e) => {
                                                    setToLoc(e.target.value);
                                                    setShowToSuggestions(true);
                                                }}
                                                onFocus={() => setShowToSuggestions(true)}
                                                placeholder={t('vehicle.destinationAddressPlaceholder')}
                                                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary-translucent)] rounded-xl p-3 pl-10 text-sm focus:outline-none focus:border-[var(--accent-primary)]"
                                            />
                                            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                                        </div>
                                        <AnimatePresence>
                                            {showToSuggestions && toSuggestions.length > 0 && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute z-[110] left-0 right-0 top-full mt-1 bg-[var(--bg-tertiary)] border border-[var(--border-primary-translucent)] rounded-xl shadow-xl max-h-48 overflow-y-auto"
                                                >
                                                    {toSuggestions.map((s: any) => (
                                                        <button 
                                                            key={s.place_id}
                                                            onClick={() => {
                                                                setToLoc(s.description);
                                                                setShowToSuggestions(false);
                                                            }}
                                                            className="w-full text-left p-3 text-xs hover:bg-[var(--bg-secondary)] border-b border-[var(--border-primary-translucent)] last:border-0"
                                                        >
                                                            {s.description}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                                {fromLoc && toLoc && (
                                    <button 
                                        onClick={handleCalculateDistance}
                                        disabled={isCalculatingDistance}
                                        className="text-[10px] font-bold text-[var(--accent-primary)] flex items-center gap-1 hover:underline"
                                    >
                                        {isCalculatingDistance ? t('vehicle.calculating') : t('vehicle.calculateFromMaps')}
                                    </button>
                                )}
                                <button 
                                    onClick={handleSaveRoute}
                                    disabled={!routeName || !fromLoc || !toLoc || distance <= 0}
                                    className="w-full bg-[var(--accent-primary)] text-[var(--text-contrast)] font-bold p-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {t('vehicle.saveRoute')}
                                </button>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {savedRoutes.map(route => (
                                    <div 
                                        key={route.id}
                                        onClick={() => setSelectedRouteId(route.id)}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${selectedRouteId === route.id ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]' : 'bg-[var(--bg-secondary)] border-[var(--border-primary-translucent)] hover:border-[var(--text-tertiary)]'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-sm">{route.name}</p>
                                                <p className="text-[10px] text-[var(--text-tertiary)]">
                                                    {(distanceUnit === 'km' ? route.distance : convertDistance(route.distance, 'km', 'miles')).toFixed(1)} {distanceUnit.toUpperCase()} • {route.from} → {route.to}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteRoute(route.id); }}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        {selectedRouteId === route.id && (
                                            <div className="absolute top-2 right-2 text-[var(--accent-primary)]">
                                                <Check size={16} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {savedRoutes.length === 0 && (
                                    <div className="col-span-full p-8 text-center border border-dashed border-[var(--border-primary)] rounded-2xl">
                                        <p className="text-sm text-[var(--text-tertiary)]">{t('vehicle.noRoutesFound')}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Calendar Selection */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-tertiary)]">{t('vehicle.selectDates')}</h3>
                        
                        {/* Selected Dates List - Moved Above Calendar */}
                        <div className="flex flex-wrap gap-2 min-h-[32px]">
                            {selectedDates.sort((a, b) => a.getTime() - b.getTime()).map(date => (
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    key={date.toISOString()} 
                                    className="bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-2 border border-[var(--accent-primary)]/30"
                                >
                                    {format(date, 'MMM d, yyyy')}
                                    <button onClick={() => toggleDate(date)} className="hover:text-red-500 transition-colors">
                                        <X size={12} />
                                    </button>
                                </motion.div>
                            ))}
                            {selectedDates.length === 0 && (
                                <p className="text-xs text-[var(--text-tertiary)] italic py-1">{t('vehicle.noDatesSelected')}</p>
                            )}
                        </div>

                        <div className="bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border-primary-translucent)] overflow-hidden shadow-inner">
                            <Calendar 
                                onClickDay={toggleDate}
                                tileClassName={({ date }) => {
                                    const isSelected = selectedDates.find(d => isSameDay(d, date));
                                    return isSelected ? 'selected-date-tile' : '';
                                }}
                                className="w-full border-none bg-transparent font-sans"
                            />
                        </div>
                    </section>

                    {/* Summary Info */}
                    {selectedRoute && selectedDates.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20 p-4 rounded-2xl flex items-start gap-3"
                        >
                            <Info className="text-[var(--accent-primary)] shrink-0" size={20} />
                            <div>
                                <p className="text-sm font-bold text-[var(--text-white)]">
                                    {t('vehicle.summaryTitle', { count: selectedDates.length })}
                                </p>
                                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                                    {t('vehicle.summaryDesc', { 
                                        km: (distanceUnit === 'km' 
                                            ? selectedDates.length * selectedRoute.distance * multiplier 
                                            : convertDistance(selectedDates.length * selectedRoute.distance * multiplier, 'km', 'miles')).toFixed(1),
                                        route: selectedRoute.name
                                    }).replace('km', distanceUnit.toUpperCase())}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[var(--border-primary-translucent)] bg-[var(--bg-secondary)]">
                    <button 
                        onClick={handleSubmit}
                        disabled={!selectedRouteId || selectedDates.length === 0 || isSubmitting}
                        className="w-full bg-[var(--accent-primary)] text-[var(--text-contrast)] font-black py-4 rounded-2xl shadow-lg shadow-[var(--accent-primary)]/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
                    >
                        {isSubmitting ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Check size={20} />
                                {t('vehicle.logTrips', { count: selectedDates.length })}
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default RecurringTripModal;
