
import React, { useState } from 'react';
import { WifiOff, RefreshCw, CloudOff, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService, useOnlineStatus } from '../services/dataService';
import { useLanguage } from '../contexts/LanguageContext';

const SyncStatus: React.FC = () => {
    // Use the hook from DataService
    const { isOnline, queueCount } = useOnlineStatus();
    const { t } = useLanguage();
    const [showInfo, setShowInfo] = useState(false);

    const handleRetry = (e: React.MouseEvent) => {
        e.stopPropagation();
        dataService.syncNow();
    };

    const toggleInfo = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowInfo(!showInfo);
    };

    // If everything is perfect (Online, No Pending items), hide.
    if (isOnline && queueCount === 0) return null;

    // State: Offline (Standard visibility - alert user)
    if (!isOnline) {
        return (
            <div className="fixed bottom-24 left-4 md:bottom-8 md:left-8 z-50 flex flex-col items-start gap-2">
                <AnimatePresence>
                    {showInfo && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                            className="bg-red-900 border border-red-500 p-4 rounded-2xl shadow-xl max-w-[240px] text-red-100 mb-2"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="text-xs font-bold uppercase tracking-wider">{t('profile.syncOfflineTitle')}</h4>
                                <button onClick={toggleInfo}><X size={14} /></button>
                            </div>
                            <p className="text-[10px] leading-relaxed opacity-90">
                                {t('profile.syncOfflineDesc')}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button 
                    onClick={toggleInfo}
                    className="flex items-center space-x-3 px-4 py-2 rounded-full shadow-lg backdrop-blur-md border border-opacity-50 transition-all duration-300 bg-red-900/90 border-red-500 text-red-100 hover:bg-red-800"
                >
                    <WifiOff size={16} />
                    <span className="text-xs font-bold whitespace-nowrap">Offline ({queueCount})</span>
                </button>
            </div>
        );
    }

    // State: Online but Pending (Compact visibility - waiting/stuck)
    return (
        <div className="fixed bottom-24 left-4 md:bottom-8 md:left-8 z-50 flex flex-col items-start gap-2">
            <AnimatePresence>
                {showInfo && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="bg-amber-900 border border-amber-500 p-4 rounded-2xl shadow-xl max-w-[240px] text-amber-100 mb-2"
                    >
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="text-xs font-bold uppercase tracking-wider">{t('profile.syncPendingTitle')}</h4>
                            <button onClick={toggleInfo}><X size={14} /></button>
                        </div>
                        <p className="text-[10px] leading-relaxed opacity-90">
                            {t('profile.syncPendingDesc')}
                        </p>
                        <button 
                            onClick={handleRetry}
                            className="mt-3 w-full flex items-center justify-center gap-2 bg-amber-800 hover:bg-amber-700 p-2 rounded-xl text-[10px] font-bold transition-colors"
                        >
                            <RefreshCw size={12} />
                            {t('common.retry')}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="group flex items-center">
                <button 
                    onClick={toggleInfo}
                    className="flex items-center justify-center bg-amber-900/60 hover:bg-amber-900/90 border border-amber-500/30 hover:border-amber-500/60 backdrop-blur-md rounded-full p-2 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                    <div className="relative flex items-center justify-center w-6 h-6">
                         <CloudOff size={18} className="text-amber-200/80" />
                         <span className="absolute -top-1.5 -right-1.5 bg-amber-600 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] h-[14px] flex items-center justify-center border border-amber-900">
                            {queueCount}
                        </span>
                    </div>
                </button>
                <div className="max-w-0 overflow-hidden group-hover:max-w-[100px] group-hover:ml-2 transition-all duration-300 ease-in-out">
                    <button 
                        onClick={handleRetry}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-800 text-amber-100 hover:bg-amber-700 transition-colors text-[10px] font-bold whitespace-nowrap"
                    >
                        <RefreshCw size={12} />
                        {t('common.syncNow')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SyncStatus;