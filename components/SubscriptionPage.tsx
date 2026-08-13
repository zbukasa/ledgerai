
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, CreditCard, ShieldCheck, Zap, Star, Building2, History, HelpCircle, Ticket, CheckCircle2, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import PricingTiers from './PricingTiers';
import { HapticService } from '../services/hapticService';

interface SubscriptionPageProps {
    onBack: () => void;
}

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const { currentUser, business, isPersonalMode, isTrialActive, trialDaysLeft, applyPromoCode } = useAuth();
    const [promoCode, setPromoCode] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [promoSuccess, setPromoSuccess] = useState(false);
    
    const activeTier = isPersonalMode ? (currentUser?.tier || 'free') : (business?.tier || 'free');

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setIsApplying(true);
        const success = await applyPromoCode(promoCode.trim().toUpperCase());
        setIsApplying(false);
        if (success) {
            HapticService.notificationSuccess();
            setPromoSuccess(true);
            setPromoCode('');
            setTimeout(() => setPromoSuccess(false), 5000);
        } else {
            HapticService.notificationError();
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-primary-translucent)] px-4 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button 
                        onClick={onBack}
                        className="p-2 -ml-2 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-primary)]"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">{t('subscription.title')}</h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
                {/* Current Status Hero */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden p-6 md:p-8 rounded-[2rem] bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary-dark)] text-[var(--text-contrast)] shadow-2xl"
                >
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <p className="text-[var(--text-contrast)]/70 text-[10px] md:text-sm font-bold uppercase tracking-widest">{t('subscription.currentTier')}</p>
                            <h2 className="text-3xl md:text-5xl font-black capitalize flex items-center gap-3">
                                {activeTier === 'free' && <Zap size={32} className="md:w-10 md:h-10" />}
                                {activeTier === 'premium' && <Star size={32} className="md:w-10 md:h-10" />}
                                {activeTier === 'enterprise' && <Building2 size={32} className="md:w-10 md:h-10" />}
                                {t(`subscription.${activeTier}`)}
                                {(isTrialActive || currentUser?.promoIsActive) && (
                                    <span className="ml-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest">
                                        {currentUser?.promoIsActive ? t('subscription.promo.active') : t('subscription.trialActive')}
                                    </span>
                                )}
                            </h2>
                            <p className="text-[var(--text-contrast)]/80 text-sm md:text-base max-w-md">
                                {currentUser?.promoIsActive 
                                    ? t('subscription.promo.benefit', { date: currentUser.promoExpiresAt ? new Date(currentUser.promoExpiresAt).toLocaleDateString() : 'soon' })
                                    : isTrialActive 
                                        ? t('subscription.trialActiveDesc', { count: trialDaysLeft })
                                        : t(`subscription.${activeTier}Desc`)}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row md:flex-col gap-2 md:gap-3">
                            <div className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-white/20 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/30 flex items-center justify-center md:justify-start gap-2 md:gap-3">
                                <ShieldCheck size={18} className="shrink-0 text-[var(--text-contrast)]" />
                                <span className="text-xs md:text-sm font-bold text-center md:text-left leading-tight text-[var(--text-contrast)]">{t('subscription.secureBilling')}</span>
                            </div>
                            <div className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-white/20 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/30 flex items-center justify-center md:justify-start gap-2 md:gap-3">
                                <CreditCard size={18} className="shrink-0 text-[var(--text-contrast)]" />
                                <span className="text-xs md:text-sm font-bold text-center md:text-left leading-tight text-[var(--text-contrast)]">{t('subscription.managePayment')}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-24 -mb-24" />
                </motion.div>

                {/* Pricing Section */}
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{t('subscription.choosePlan')}</h2>
                        <p className="text-sm md:text-base text-[var(--text-secondary)]">{t('subscription.scaleBusiness')}</p>
                    </div>
                    
                    <PricingTiers currentTier={activeTier} />
                </div>

                {/* FAQ / Support Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-5 md:p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-primary-translucent)] space-y-3 md:space-y-4">
                        <div className="flex items-center gap-3 text-[var(--accent-primary)]">
                            <History size={20} className="md:w-6 md:h-6" />
                            <h3 className="text-base md:text-lg font-bold text-[var(--text-primary)]">{t('subscription.billingHistory')}</h3>
                        </div>
                        <p className="text-xs md:text-sm text-[var(--text-secondary)]">{t('subscription.billingHistoryDesc')}</p>
                        <button className="text-xs md:text-sm font-bold text-[var(--accent-primary)] hover:underline">{t('subscription.viewHistory')} →</button>
                    </div>
                    <div className="p-5 md:p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-primary-translucent)] space-y-3 md:space-y-4">
                        <div className="flex items-center gap-3 text-[var(--accent-primary)]">
                            <HelpCircle size={20} className="md:w-6 md:h-6" />
                            <h3 className="text-base md:text-lg font-bold text-[var(--text-primary)]">{t('subscription.needHelp')}</h3>
                        </div>
                        <p className="text-xs md:text-sm text-[var(--text-secondary)]">{t('subscription.needHelpDesc')}</p>
                        <button className="text-xs md:text-sm font-bold text-[var(--accent-primary)] hover:underline">{t('subscription.contactSupport')} →</button>
                    </div>
                </div>

                {/* Promo Code Section - Moved to Bottom */}
                <div className="bg-[var(--bg-secondary)] p-6 rounded-3xl border border-[var(--border-primary-translucent)] shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--accent-primary)]">
                            <Ticket size={20} />
                        </div>
                        <h3 className="font-bold text-[var(--text-primary)] text-lg">{t('subscription.promo.title')}</h3>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-grow">
                            <input 
                                type="text"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                placeholder={t('subscription.promo.placeholder')}
                                className="w-full bg-[var(--bg-primary)] p-4 rounded-xl text-[var(--text-primary)] font-semibold border border-transparent focus:border-[var(--accent-primary)] outline-none transition-all uppercase"
                                disabled={isApplying || promoSuccess}
                            />
                            {promoSuccess && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                                    <CheckCircle2 size={20} />
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={handleApplyPromo}
                            disabled={!promoCode.trim() || isApplying || promoSuccess}
                            className="px-8 py-4 rounded-xl bg-[var(--accent-primary)] text-white font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
                        >
                            {isApplying ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    {t('subscription.promo.applying')}
                                </>
                            ) : promoSuccess ? (
                                t('subscription.promo.success')
                            ) : (
                                t('subscription.promo.apply')
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;
