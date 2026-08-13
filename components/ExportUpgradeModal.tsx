
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, CheckCircle2, FileSpreadsheet, Archive, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ExportUpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
}

export const ExportUpgradeModal: React.FC<ExportUpgradeModalProps> = ({ isOpen, onClose, onUpgrade }) => {
    const { t } = useLanguage();

    const features = [
        { title: t('exportUpgrade.feature1Title'), desc: t('exportUpgrade.feature1Desc') },
        { title: t('exportUpgrade.feature2Title'), desc: t('exportUpgrade.feature2Desc') },
        { title: t('exportUpgrade.feature3Title'), desc: t('exportUpgrade.feature3Desc') },
        { title: t('exportUpgrade.feature4Title'), desc: t('exportUpgrade.feature4Desc') }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-center items-start overflow-y-auto p-4 md:p-8 bg-black/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-2xl my-auto bg-[var(--bg-secondary)] border border-[var(--border-primary-translucent)] rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden"
                    >
                        {/* Left Side: Visual/Enticing */}
                        <div className="md:w-5/12 bg-gradient-to-br from-[var(--accent-primary)] to-orange-600 p-8 text-white flex flex-col justify-between relative overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-black/20 rounded-full blur-3xl" />
                            
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                                    <Crown className="text-white" size={24} />
                                </div>
                                <h2 className="text-3xl font-black leading-tight mb-4 tracking-tight">
                                    {t('exportUpgrade.title')}
                                </h2>
                                <p className="text-white/80 text-sm font-medium leading-relaxed">
                                    {t('exportUpgrade.subtitle')}
                                </p>
                            </div>

                            <div className="relative z-10 mt-8 space-y-4">
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                        <FileSpreadsheet size={16} />
                                    </div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest">{t('exportUpgrade.debitCreditLedger')}</div>
                                </div>
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                        <Archive size={16} />
                                    </div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest">{t('exportUpgrade.receiptZip')}</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Details & CTA */}
                        <div className="md:w-7/12 p-8 pb-10 flex flex-col relative">
                            <button 
                                onClick={onClose}
                                className="absolute right-6 top-6 p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors rounded-full hover:bg-[var(--bg-tertiary)]"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                                    <ShieldCheck size={12} />
                                    {t('exportUpgrade.accountantReady')}
                                </div>

                                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">
                                    {t('exportUpgrade.whyUpgrade')}
                                </h3>

                                <ul className="space-y-4 mb-8">
                                    {features.map((item, i) => (
                                        <li key={i} className="flex gap-3 group">
                                            <div className="mt-1">
                                                <CheckCircle2 size={18} className="text-[var(--accent-primary)]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                                                    {item.title}
                                                </p>
                                                <p className="text-xs text-[var(--text-tertiary)]">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={onUpgrade}
                                    className="w-full group flex items-center justify-center gap-3 py-4 bg-[var(--accent-primary)] text-white font-black rounded-2xl shadow-xl shadow-[var(--accent-primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    {t('exportUpgrade.upgradeAction')}
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-3 text-[var(--text-tertiary)] text-xs font-bold uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors"
                                >
                                    {t('exportUpgrade.maybeLater')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
