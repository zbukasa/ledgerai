
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Receipt, ChevronUp, Check, AlertCircle, X } from 'lucide-react';
import { useReceipt } from '../contexts/ReceiptContext';

const MinimizedReceiptProgress: React.FC = () => {
    const { state, progress, isMinimized, setMinimized, setOpen, parsedTransactions, reset } = useReceipt();

    if (!isMinimized) return null;

    const isProcessing = state === 'processing';
    const isDone = state === 'confirming';
    const isError = state === 'error';
    
    const percent = Math.round((progress.current / progress.total) * 100) || 0;

    const handleDiscard = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Discard this batch?')) {
            reset();
        }
    };

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={() => {
                setMinimized(false);
                setOpen(true);
            }}
            className="fixed bottom-24 left-4 right-4 md:left-auto md:right-24 md:bottom-8 md:w-80 bg-[var(--bg-secondary)] border border-[var(--border-primary-translucent)] rounded-2xl shadow-2xl p-4 cursor-pointer z-[60] group hover:border-[var(--accent-primary)] transition-all"
        >
            <button 
                onClick={handleDiscard}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <X size={14} />
            </button>
            <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                    {isProcessing ? (
                        <>
                            <Loader2 className="animate-spin text-[var(--accent-primary)]" size={32} />
                            <Receipt className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50" size={12} />
                        </>
                    ) : isDone ? (
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                            <Check size={20} />
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                            <AlertCircle size={20} />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-bold text-white truncate">
                            {isProcessing ? 'Analyzing Documents...' : isDone ? 'Analysis Complete' : 'Analysis Failed'}
                        </p>
                        <ChevronUp size={14} className="text-[var(--text-tertiary)] group-hover:text-white transition-colors" />
                    </div>
                    
                    {isProcessing ? (
                        <div className="space-y-1">
                            <div className="flex justify-between text-[9px] text-[var(--text-tertiary)] uppercase tracking-widest">
                                <span>{progress.current} / {progress.total} Docs</span>
                                <span>{percent}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percent}%` }}
                                    className="h-full bg-[var(--accent-primary)]"
                                />
                            </div>
                        </div>
                    ) : isDone ? (
                        <p className="text-[10px] text-[var(--text-secondary)]">
                            {parsedTransactions.length} transactions ready for review.
                        </p>
                    ) : (
                        <p className="text-[10px] text-red-400">
                            Click to see error details.
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default MinimizedReceiptProgress;
