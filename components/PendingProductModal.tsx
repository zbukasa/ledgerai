
import React from 'react';
import { motion } from 'framer-motion';
import { Package, Check, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PendingProductModalProps {
    name: string;
    onResolve: (shouldTrack: boolean) => void;
}

const PendingProductModal: React.FC<PendingProductModalProps> = ({ name, onResolve }) => {
    const { t } = useLanguage();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-[var(--bg-secondary)] border border-[var(--border-primary-translucent)] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-[var(--accent-primary-light)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[var(--accent-primary)]">
                        <Package size={32} />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">
                        {t('inventory.newProductDetected', { name })}
                    </h3>
                    
                    <p className="text-[var(--text-secondary)] mb-8">
                        {t('inventory.trackInInventory')}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => onResolve(false)}
                            className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-[var(--border-primary-translucent)] text-[var(--text-secondary)] font-bold hover:bg-[var(--bg-tertiary)] transition-colors"
                        >
                            <X size={20} />
                            {t('inventory.ignoreAction')}
                        </button>
                        
                        <button
                            onClick={() => onResolve(true)}
                            className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-[var(--accent-primary)] text-white font-bold shadow-lg shadow-[var(--accent-primary-shadow)] hover:opacity-90 transition-opacity"
                        >
                            <Check size={20} />
                            {t('inventory.trackAction')}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PendingProductModal;
