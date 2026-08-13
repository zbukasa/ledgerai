
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Plus, Settings2, GripVertical } from 'lucide-react';
import { QuickAddAction } from '../types';
import { AVAILABLE_QUICK_ACTIONS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import * as LucideIcons from 'lucide-react';

interface QuickAddCustomizerProps {
    isOpen: boolean;
    onClose: () => void;
    selectedIds: string[];
    onUpdate: (ids: string[]) => void;
}

const QuickAddCustomizer: React.FC<QuickAddCustomizerProps> = ({ isOpen, onClose, selectedIds, onUpdate }) => {
    const { t } = useLanguage();

    const toggleAction = (id: string) => {
        if (selectedIds.includes(id)) {
            if (selectedIds.length > 1) {
                onUpdate(selectedIds.filter(i => i !== id));
            }
        } else {
            if (selectedIds.length < 6) {
                onUpdate([...selectedIds, id]);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-[var(--bg-secondary)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[var(--border-primary)]"
            >
                <div className="p-4 border-b border-[var(--border-primary)] flex justify-between items-center bg-[var(--bg-tertiary)]/30">
                    <div className="flex items-center gap-2">
                        <Settings2 size={20} className="text-[var(--accent-primary-light)]" />
                        <h2 className="text-lg font-bold text-[var(--text-white)]">Customize Quick Add</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--bg-tertiary)] rounded-full text-[var(--text-secondary)]">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
                    <p className="text-xs text-[var(--text-secondary)] mb-4 px-1">
                        Select up to 6 actions to display on your dashboard for faster entry.
                    </p>
                    
                    {AVAILABLE_QUICK_ACTIONS.map((action) => {
                        const isSelected = selectedIds.includes(action.id);
                        // @ts-ignore
                        const Icon = LucideIcons[action.icon] || LucideIcons.HelpCircle;
                        
                        return (
                            <button
                                key={action.id}
                                onClick={() => toggleAction(action.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                                    isSelected 
                                    ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)] text-[var(--text-white)]' 
                                    : 'bg-[var(--bg-tertiary)]/20 border-[var(--border-primary-translucent)] text-[var(--text-secondary)] hover:border-[var(--border-primary)]'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'}`}>
                                        <Icon size={18} />
                                    </div>
                                    <span className="font-semibold text-sm">{t(action.labelKey)}</span>
                                </div>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                                    isSelected 
                                    ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white' 
                                    : 'border-[var(--border-primary)]'
                                }`}>
                                    {isSelected && <Check size={14} />}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 bg-[var(--bg-tertiary)]/10 border-t border-[var(--border-primary)]">
                    <button 
                        onClick={onClose}
                        className="w-full py-3 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-gradient-from)] text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]"
                    >
                        Done
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default QuickAddCustomizer;
