
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Play, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { SubscriptionTier } from '../types';

interface UsageLimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    metric: 'voiceCommands' | 'aiInsights' | 'receiptScans';
    onAdComplete: () => void;
    onUpgrade?: () => void;
}

const UsageLimitModal: React.FC<UsageLimitModalProps> = ({ isOpen, onClose, metric, onAdComplete, onUpgrade }) => {
    const { upgradeTier } = useAuth();
    const { t } = useLanguage();
    const [isWatchingAd, setIsWatchingAd] = useState(false);
    const [adProgress, setAdProgress] = useState(0);

    const metricLabels = {
        voiceCommands: 'Voice Commands',
        aiInsights: 'AI Insights',
        receiptScans: 'Receipt Scans'
    };

    const handleWatchAd = () => {
        setIsWatchingAd(true);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 2;
            setAdProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setIsWatchingAd(false);
                onAdComplete();
                onClose();
            }
        }, 100); // 5 second "ad"
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-primary-translucent)] rounded-2xl overflow-hidden shadow-2xl"
                    >
                        {isWatchingAd ? (
                            <div className="p-8 text-center space-y-6">
                                <div className="relative w-24 h-24 mx-auto">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="44"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            className="text-[var(--bg-tertiary)]"
                                        />
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="44"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={276.46}
                                            strokeDashoffset={276.46 * (1 - adProgress / 100)}
                                            className="text-[var(--accent-primary)] transition-all duration-100"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Play className="text-[var(--accent-primary)] fill-current" size={32} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white">Watching Ad...</h3>
                                    <p className="text-[var(--text-secondary)] text-sm">Your {metricLabels[metric]} will be unlocked shortly.</p>
                                </div>
                                <div className="w-full bg-[var(--bg-tertiary)] h-2 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-[var(--accent-primary)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${adProgress}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="relative p-6 border-b border-[var(--border-primary-translucent)]">
                                    <button 
                                        onClick={onClose}
                                        className="absolute right-4 top-4 p-2 text-[var(--text-tertiary)] hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                                            <AlertCircle size={24} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">Limit Reached</h3>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    <p className="text-[var(--text-secondary)]">
                                        You've reached your monthly limit for <span className="text-white font-bold">{metricLabels[metric]}</span> on the Free tier.
                                    </p>

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => onUpgrade ? onUpgrade() : upgradeTier('premium')}
                                            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        >
                                            <Crown size={20} />
                                            Upgrade to Premium
                                        </button>
                                        
                                        <div className="relative flex items-center py-2">
                                            <div className="flex-grow border-t border-[var(--border-primary-translucent)]"></div>
                                            <span className="flex-shrink mx-4 text-[var(--text-tertiary)] text-xs font-bold uppercase tracking-widest">OR</span>
                                            <div className="flex-grow border-t border-[var(--border-primary-translucent)]"></div>
                                        </div>

                                        <button
                                            onClick={handleWatchAd}
                                            className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--bg-tertiary)] text-white font-bold rounded-xl hover:bg-[var(--bg-interactive-hover)] transition-all"
                                        >
                                            <Play size={20} />
                                            Watch Ad for +1 Use
                                        </button>
                                    </div>

                                    <p className="text-center text-[var(--text-tertiary)] text-[10px] uppercase tracking-wider">
                                        Premium includes unlimited AI, Voice, and OCR.
                                    </p>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UsageLimitModal;
