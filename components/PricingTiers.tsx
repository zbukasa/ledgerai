
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Shield, Zap, Building2, Users, Cloud, CreditCard, BarChart3, Mic, ScanLine } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { SubscriptionTier } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency, currencyDetails } from '../contexts/CurrencyContext';

interface PricingTiersProps {
    onUpgrade?: (tier: SubscriptionTier) => void;
    currentTier?: SubscriptionTier;
    compact?: boolean;
}

const BASE_PRICES = {
    free: 0,
    premium: 14.99,
    enterprise: 49.99,
    premiumYearly: 120
};

const PricingTiers: React.FC<PricingTiersProps> = ({ onUpgrade, currentTier = 'free', compact = false }) => {
    const { t, language } = useLanguage();
    const { upgradeTier, isTrialActive, trialDaysLeft, startTrial, currentUser } = useAuth();
    const { preferredCurrency, convertAmount } = useCurrency();

    const handleUpgrade = (tier: SubscriptionTier) => {
        if (tier === 'premium' && !currentUser?.hasUsedTrial && currentTier === 'free') {
            startTrial();
            return;
        }
        if (onUpgrade) {
            onUpgrade(tier);
        } else {
            upgradeTier(tier);
        }
    };

    const getLocalizedPriceData = (amount: number) => {
        const currencyData = currencyDetails[preferredCurrency];
        const pppFactor = currencyData?.pppFactor || 1.0;
        const pppAdjustedAmount = amount * pppFactor;
        
        const convertedAmount = convertAmount(pppAdjustedAmount, 'USD', preferredCurrency);
        
        const localeMap: Record<string, string> = {
            'en': 'en-US',
            'fr': 'fr-FR',
            'ln': 'fr-CD',
            'sw': 'sw-TZ',
            'es': 'es-ES',
            'pt': 'pt-PT',
            'hi': 'hi-IN',
            'ar': 'ar-SA'
        };
        const locale = localeMap[language] || language;

        const formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: preferredCurrency,
            minimumFractionDigits: convertedAmount % 1 === 0 ? 0 : 2,
        });

        const parts = formatter.formatToParts(convertedAmount);
        const currencySymbol = parts.find(p => p.type === 'currency')?.value || '';
        const localizedPrice = parts.filter(p => p.type !== 'currency').map(p => p.value).join('').trim();
        const fullPrice = formatter.format(convertedAmount);

        return { localizedPrice, currencySymbol, fullPrice };
    };

    const premiumPriceData = getLocalizedPriceData(BASE_PRICES.premium);
    const enterprisePriceData = getLocalizedPriceData(BASE_PRICES.enterprise);
    const premiumYearlyPriceData = getLocalizedPriceData(BASE_PRICES.premiumYearly);

    const isTier1 = (currencyDetails[preferredCurrency]?.pppFactor || 1.0) >= 0.8;
    const bankSyncLabel = t('subscription.features.bankSync') + (isTier1 ? '' : ` ${t('subscription.features.tier1Only')}`);

    type TierFeature = { text: string; included: boolean; important?: boolean };
    const tiers: Array<{ features: TierFeature[]; [key: string]: any }> = [
        {
            id: 'free' as SubscriptionTier,
            name: t('subscription.free'),
            price: t('subscription.pricing.free'),
            localizedPrice: t('subscription.pricing.free'),
            currencySymbol: '',
            period: '',
            icon: <Zap className="text-blue-500" />,
            description: t('subscription.freeDescription'),
            features: [
                { text: t('subscription.features.perMonth', { count: 10 }) + ' ' + t('subscription.features.voice'), included: true },
                { text: t('subscription.features.perMonth', { count: 5 }) + ' ' + t('subscription.features.insights'), included: true },
                { text: t('subscription.features.perMonth', { count: 5 }) + ' ' + t('subscription.features.ocr'), included: true },
                { text: t('subscription.features.basicExport'), included: true },
                { text: t('subscription.features.tripTracker'), included: true },
                { text: t('subscription.features.proReports'), included: false },
                { text: t('subscription.features.ads'), included: true },
                { text: t('subscription.features.cloudBackup'), included: false },
            ],
            buttonText: currentTier === 'free' ? t('subscription.currentPlan') : t('subscription.downgrade'),
            highlight: false
        },
        {
            id: 'premium' as SubscriptionTier,
            name: t('subscription.premium'),
            price: premiumPriceData.localizedPrice,
            currencySymbol: premiumPriceData.currencySymbol,
            period: t('subscription.pricing.premiumPeriod', { amount: premiumYearlyPriceData.fullPrice }),
            icon: <Star className="text-amber-500" />,
            description: t('subscription.premiumDescription'),
            features: [
                { text: t('subscription.features.unlimited') + ' ' + t('subscription.features.voice'), included: true },
                { text: t('subscription.features.unlimited') + ' ' + t('subscription.features.insights'), included: true },
                { text: t('subscription.features.unlimited') + ' ' + t('subscription.features.ocr'), included: true },
                { text: t('subscription.features.accountantLedger'), included: true, important: true },
                { text: t('subscription.features.proReports'), included: true, important: true },
                { text: t('subscription.features.receiptZip'), included: true, important: true },
                { text: t('subscription.features.noAds'), included: true, important: true },
                { text: t('subscription.features.cloudBackup'), included: true },
                { text: bankSyncLabel, included: isTier1 },
            ],
            buttonText: currentTier === 'premium' 
                ? (isTrialActive ? t('subscription.trialActive') : t('subscription.currentPlan')) 
                : (currentTier === 'enterprise' 
                    ? t('subscription.downgrade') 
                    : (!currentUser?.hasUsedTrial ? t('subscription.startTrial') : t('subscription.upgradeNow'))),
            highlight: true,
            badge: isTrialActive ? t('subscription.trialDaysLeft', { count: trialDaysLeft }) : t('subscription.mostPopular')
        },
        {
            id: 'enterprise' as SubscriptionTier,
            name: t('subscription.enterprise'),
            price: enterprisePriceData.localizedPrice,
            currencySymbol: enterprisePriceData.currencySymbol,
            period: t('subscription.pricing.enterprisePeriod'),
            icon: <Building2 className="text-purple-500" />,
            description: t('subscription.enterpriseDescription'),
            features: [
                { text: t('subscription.features.multiUser'), included: true, important: true },
                { text: t('subscription.features.rbac'), included: true, important: true },
                { text: t('subscription.features.inventory'), included: true, important: true },
                { text: t('subscription.features.proReports'), included: true, important: true },
                { text: t('subscription.features.batchManagement'), included: true },
                { text: t('subscription.features.auditLogs'), included: true, important: true },
                { text: t('subscription.features.cloudBackup'), included: true },
                { text: bankSyncLabel, included: isTier1 },
            ],
            buttonText: currentTier === 'enterprise' ? t('subscription.currentPlan') : t('subscription.upgradeNow'),
            highlight: false,
            badge: t('subscription.bestValue')
        }
    ];

    return (
        <div className={`grid grid-cols-1 ${compact ? '' : 'md:grid-cols-3'} gap-6`}>
            {tiers.map((tier, idx) => (
                <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative flex flex-col p-6 rounded-3xl border-2 transition-all ${
                        currentTier === tier.id
                            ? 'bg-[var(--bg-secondary)] border-[var(--accent-primary)] shadow-xl z-10'
                            : tier.highlight 
                                ? 'bg-[var(--bg-secondary)] border-[var(--accent-primary)] shadow-xl md:scale-105 z-10' 
                                : 'bg-[var(--bg-secondary)] border-[var(--border-primary-translucent)] hover:border-[var(--accent-primary)]/30'
                    }`}
                >
                    {tier.badge && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--accent-primary)] text-[var(--text-contrast)] text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg z-20">
                            {tier.badge}
                        </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-2xl bg-[var(--bg-tertiary)]">
                            {tier.icon}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[var(--text-primary)]">{tier.name}</h3>
                            <p className="text-xs text-[var(--text-secondary)]">{tier.description}</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex flex-col">
                            {tier.id === 'enterprise' && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)] mb-0.5">
                                    {t('subscription.startsAt')}
                                </span>
                            )}
                            <div className="flex items-baseline gap-1">
                                {tier.currencySymbol && (
                                    <span className="text-xl font-bold text-[var(--text-primary)] self-start mt-1">
                                        {tier.currencySymbol}
                                    </span>
                                )}
                                <span className="text-4xl font-black text-[var(--text-primary)]">{tier.price}</span>
                                {tier.id === 'free' && <span className="text-sm text-[var(--text-tertiary)]">{tier.period}</span>}
                            </div>
                            {tier.id !== 'free' && (
                                <div className="text-xs font-bold text-[var(--accent-primary)] mt-1">
                                    {tier.period}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-grow space-y-4 mb-8">
                        {tier.features.map((feature, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-3">
                                <div className={`mt-0.5 p-0.5 rounded-full ${
                                    feature.included 
                                        ? (feature.important ? 'bg-amber-500/20 text-amber-500 ring-2 ring-amber-500/50' : 'bg-emerald-500/20 text-emerald-500') 
                                        : 'bg-red-500/20 text-red-500'
                                }`}>
                                    {feature.included ? <Check size={12} /> : <X size={12} />}
                                </div>
                                <span className={`text-sm ${
                                    feature.included 
                                        ? (feature.important ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]') 
                                        : 'text-[var(--text-tertiary)] line-through opacity-50'
                                }`}>
                                    {feature.text}
                                </span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => handleUpgrade(tier.id)}
                        disabled={currentTier === tier.id}
                        className={`w-full py-4 px-4 rounded-2xl font-bold transition-all active:scale-95 whitespace-normal leading-tight z-10 ${
                            currentTier === tier.id
                                ? 'bg-[var(--accent-primary)] text-[var(--text-contrast)] shadow-inner ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--bg-primary)]'
                                : tier.highlight
                                    ? 'bg-[var(--accent-primary)] text-[var(--text-contrast)] shadow-lg hover:brightness-110'
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary-translucent)] hover:bg-[var(--bg-interactive-hover)]'
                        } disabled:opacity-100 disabled:cursor-default disabled:scale-100`}
                    >
                        {tier.buttonText}
                    </button>
                </motion.div>
            ))}
            
            <div className="md:col-span-3 text-center mt-4">
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold opacity-60">
                    {t('subscription.pricing.taxDisclaimer')}
                </p>
            </div>
        </div>
    );
};

export default PricingTiers;

const X = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);
