
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Camera, Image as ImageIcon, Loader2, AlertTriangle, RefreshCw, X, Check, Edit, Trash2, Plus, Play, Calculator, Layers, Receipt, ChevronRight, AlertCircle, ShieldAlert, Minimize2 } from 'lucide-react';
import { Transaction, ParsedTransaction, ImageInput, LineItem } from '../types';
import { useReceipt } from '../contexts/ReceiptContext';
import { useAds } from './ads/AdController';
import TransactionForm from './TransactionForm';
import { useLanguage } from '../contexts/LanguageContext';
import { useCategories } from '../contexts/CategoryContext';
import { getIconComponent } from '../utils/helpers';
import CameraCapture from './CameraCapture';
import { v4 as uuidv4 } from 'uuid';
import { dataService } from '../services/dataService';
import { HapticService } from '../services/hapticService';

interface ReceiptProcessorProps {
    onClose: () => void;
    onSave: (transaction: Omit<Transaction, 'id' | 'userId'>) => Promise<void>;
}

const ReceiptProcessor: React.FC<ReceiptProcessorProps> = ({ onClose, onSave }) => {
    const { t } = useLanguage();
    const { showInterstitial } = useAds();
    const { findCategoryByName } = useCategories();
    const {
        state,
        parsedTransactions,
        images,
        error,
        progress,
        isReading,
        addImage,
        removeImage,
        processAllImages,
        handleRetry,
        removeTransaction,
        updateTransaction,
        setMinimized,
        reset
    } = useReceipt();

    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleClose = () => {
        if (state === 'processing' || state === 'confirming') {
            setMinimized(true);
            onClose();
        } else {
            reset();
            onClose();
        }
    };

    const handleConfirmAll = async () => {
        if (parsedTransactions.length === 0 || isSaving) return;
        setIsSaving(true);

        // Filter out any standalone odometer readings that didn't get paired
        // (i.e., they have 0 amount and are marked as odometer logs)
        const finalToSave = parsedTransactions.filter(tx => {
            const isStandaloneOdo = (tx.item?.toLowerCase().includes('odometer') || tx.item === 'Odometer Log') && Number(tx.amount) === 0;
            return !isStandaloneOdo;
        });

        // Try to find a valid merchant anywhere in the batch to heal "NULL" entries
        let merchantHealer: string | undefined;
        parsedTransactions.forEach(tx => {
            if (tx.merchant && tx.merchant.toLowerCase() !== 'null') {
                merchantHealer = tx.merchant;
            }
        });

        // Group by receipt image(s) for itemization
        const groups: Record<string, (ParsedTransaction & { receiptGroupId?: string })[]> = {};
        finalToSave.forEach(tx => {
            const gid = (tx as any).receiptGroupId || 'default';
            if (!groups[gid]) groups[gid] = [];
            groups[gid].push(tx);
        });

        const groupEntries = Object.entries(groups);
        
        try {
            for (const [gid, groupItems] of groupEntries) {
                const firstTx = groupItems[0];
                const totalAmount = groupItems.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
                
                const imgIds = gid.split(',').map(id => id.replace('receipt-', ''));
                const specificImages = images
                    .filter(img => imgIds.includes(img.id))
                    .map(img => img.base64);

                const lineItems: LineItem[] = groupItems.map(tx => ({
                    id: uuidv4(),
                    item: tx.item,
                    amount: Number(tx.amount) || 0,
                    category: tx.category,
                    quantity: tx.quantity
                }));

                const category = findCategoryByName(firstTx.category);
                const transactionDate = firstTx.date ? new Date(firstTx.date) : new Date();

                const data: Omit<Transaction, 'id' | 'userId'> = {
                    type: (firstTx.transactionType || 'expense').toLowerCase().trim() as any,
                    amount: totalAmount,
                    currency: (firstTx.currency || 'USD').toUpperCase().trim() as any,
                    item: groupItems.length > 1 ? `${firstTx.merchant || merchantHealer || 'Merchant'} Receipt` : firstTx.item,
                    date: isNaN(transactionDate.getTime()) ? new Date() : transactionDate,
                    merchant: firstTx.merchant && firstTx.merchant.toLowerCase() !== 'null' ? firstTx.merchant : merchantHealer,
                    categoryId: category?.id || 'cat-other',
                    kilometers: firstTx.kilometers,
                    receiptImages: specificImages,
                    lineItems: lineItems,
                    hashIdempotency: firstTx.hashIdempotency
                };

                await onSave(data);
            }
            HapticService.notificationSuccess();
            onClose(); 
        } catch (err) {
            console.error("Batch save failed", err);
            HapticService.notificationError();
            setIsSaving(false);
        }
    };
    
    const handleCameraCapture = (blob: Blob) => {
        HapticService.impactLight();
        setIsCameraActive(false);
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        addImage(file);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const fileList = Array.from(files);
            await Promise.all(fileList.map(file => addImage(file)));
        }
    };

    const handleProcessWithAds = () => {
        HapticService.impactMedium();
        showInterstitial(() => {
            processAllImages();
        });
    };

    const renderContent = () => {
        if (isCameraActive) {
             return <CameraCapture onCapture={handleCameraCapture} onCancel={() => setIsCameraActive(false)} />;
        }

        switch (state) {
            case 'processing':
                return <ProcessingView images={images} progress={progress} onClose={handleClose} onMinimize={() => { setMinimized(true); onClose(); }} />;
            case 'confirming':
                return <ConfirmationView 
                            transactions={parsedTransactions} 
                            onConfirmAll={handleConfirmAll} 
                            onRetry={handleRetry} 
                            onClose={handleClose} 
                            images={images}
                            onRemove={removeTransaction}
                            onUpdate={updateTransaction}
                            isSaving={isSaving}
                        />;
            case 'error':
                return <ErrorView error={error || t('receiptProcessor.unknownError')} onRetry={handleRetry} onClose={handleClose} />;
            case 'idle':
            default:
                return (
                    <IdleView 
                        images={images} 
                        onFileChange={handleFileChange} 
                        onCameraStart={() => setIsCameraActive(true)} 
                        onProcess={handleProcessWithAds}
                        onRemoveImage={removeImage}
                        onClose={handleClose}
                    />
                );
        }
    };
    
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-xl bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border-primary-translucent)] overflow-hidden flex flex-col h-full max-h-[85vh] relative"
            >
                {isReading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[60] flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-[var(--accent-primary)] mb-4" size={40} />
                        <p className="text-white font-bold">Reading Document...</p>
                        <p className="text-white/60 text-xs">This may take a moment for large files.</p>
                    </div>
                )}
                {renderContent()}
            </motion.div>
        </motion.div>
    );
};

const IdleView = ({ images, onFileChange, onCameraStart, onProcess, onRemoveImage, onClose }: { 
    images: ImageInput[], 
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
    onCameraStart: () => void,
    onProcess: () => void,
    onRemoveImage: (id: string) => void,
    onClose: () => void
}) => {
    const { t } = useLanguage();
    return (
        <div className="p-6 flex flex-col h-full relative">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-[var(--text-tertiary)] hover:text-white hover:bg-[var(--bg-tertiary)] rounded-full transition-colors z-10"
            >
                <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-[var(--text-white)] text-center">{t('receiptProcessor.title')}</h2>
            <p className="text-[var(--text-secondary)] mt-2 mb-6 text-center">
                Batch process receipts, bank statements, or pair fuel receipts with odometer photos.
            </p>
            
            <div className="flex-1 overflow-y-auto space-y-6 px-1 custom-scrollbar">
                {images.length > 0 && (
                    <div className="bg-[var(--bg-tertiary)] p-3 rounded-xl border border-[var(--border-primary-translucent)] mb-4 shadow-inner">
                        <div className="flex justify-between items-center mb-3 px-1">
                             <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Selected Documents</span>
                             <span className="text-[10px] font-bold text-[var(--accent-primary-light)]">{images.length} added</span>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {images.map(img => (
                                <div key={img.id} className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 border-[var(--accent-primary)]/30 shadow-md group">
                                    <img src={img.previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                    {/* @ts-ignore */}
                                    {img.isPotentialDuplicate && (
                                        <div className="absolute inset-0 bg-amber-500/40 flex items-center justify-center pointer-events-none">
                                            <AlertCircle size={24} className="text-white drop-shadow-md" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-1 left-1 px-1 bg-black/60 rounded text-[8px] text-white font-bold uppercase">
                                        {img.mimeType.includes('image') ? 'Photo' : 'Doc'}
                                    </div>
                                    <button 
                                        onClick={() => onRemoveImage(img.id)}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            <button 
                                onClick={onCameraStart}
                                className="w-24 h-24 rounded-lg flex-shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-primary)] text-[var(--text-tertiary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all bg-[var(--bg-primary)]/30"
                            >
                                <Plus size={24} />
                            </button>
                        </div>
                        <div className="mt-2 px-1">
                            <p className="text-[9px] text-[var(--text-tertiary)] italic">
                                Tip: Add both a fuel receipt and an odometer photo to record them together.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        type="button"
                        onClick={onCameraStart}
                        className="group flex flex-col items-center justify-center p-6 bg-[var(--bg-tertiary)] rounded-xl cursor-pointer hover:bg-[var(--accent-primary-light)]/10 transition-all border-2 border-transparent hover:border-[var(--accent-primary)]"
                    >
                        <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-3 group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-colors shadow-md">
                            <Camera size={24} className="text-[var(--accent-primary-light)]" />
                        </div>
                        <span className="text-sm font-semibold text-[var(--text-primary)]">{t('receiptProcessor.takePhoto')}</span>
                    </button>

                    <label className="group flex flex-col items-center justify-center p-6 bg-[var(--bg-tertiary)] rounded-xl cursor-pointer hover:bg-[var(--accent-primary-light)]/10 transition-all border-2 border-transparent hover:border-[var(--accent-primary)]">
                        <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-3 group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-colors shadow-md">
                            <UploadCloud size={24} className="text-[var(--accent-primary-light)]" />
                        </div>
                        <span className="text-sm font-semibold text-[var(--text-primary)]">{t('receiptProcessor.uploadFile')}</span>
                        <input type="file" multiple accept="image/*,application/pdf" onChange={onFileChange} className="hidden" />
                    </label>
                </div>
            </div>

            <button 
                onClick={onProcess}
                disabled={images.length === 0}
                className="w-full mt-6 py-4 bg-[var(--accent-primary)] text-white font-bold rounded-xl flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shrink-0 transition-transform active:scale-95"
            >
                <Play size={20} />
                <span>Start Batch Analysis ({images.length})</span>
            </button>
        </div>
    );
};

const ProcessingView = ({ images, progress, onClose, onMinimize }: { images: ImageInput[], progress: { current: number, total: number, merchant: string }, onClose: () => void, onMinimize: () => void }) => {
    const percent = Math.round((progress.current / progress.total) * 100);

    return (
        <div className="p-10 text-center flex flex-col items-center justify-center h-full bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)] relative">
            <div className="absolute top-4 right-4 flex gap-2">
                <button 
                    onClick={onMinimize}
                    className="p-2 text-[var(--text-tertiary)] hover:text-white hover:bg-[var(--bg-tertiary)] rounded-full transition-colors z-10"
                    title="Minimize"
                >
                    <Minimize2 size={20} />
                </button>
                <button 
                    onClick={onClose}
                    className="p-2 text-[var(--text-tertiary)] hover:text-white hover:bg-[var(--bg-tertiary)] rounded-full transition-colors z-10"
                >
                    <X size={20} />
                </button>
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-white)] mb-4 tracking-tight">AI Document Engine</h2>
            
            <div className="w-full max-w-sm mb-12">
                <div className="flex justify-between text-[10px] text-[var(--text-secondary)] mb-2 font-bold uppercase tracking-widest">
                    <span>Analyzing Document {progress.current || 1} of {progress.total}</span>
                    <span className="text-[var(--accent-primary-light)]">{percent}%</span>
                </div>
                <div className="h-2 w-full bg-[var(--bg-tertiary)] rounded-full overflow-hidden shadow-inner border border-[var(--border-primary-translucent)]">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary-light)]"
                    />
                </div>
            </div>

            <div className="relative mb-8">
                 <Loader2 className="animate-spin text-[var(--accent-primary-light)]" size={64} />
                 <Receipt className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50" size={20} />
            </div>
            
            <p className="text-[var(--text-primary)] font-semibold text-lg">{progress.merchant}</p>
            <p className="text-[var(--text-secondary)] text-sm mt-1">Extracting totals and line items...</p>
        </div>
    );
};

const ConfirmationView = ({ 
    transactions, 
    onConfirmAll, 
    onRetry, 
    onClose, 
    images,
    onRemove,
    onUpdate,
    isSaving
}: { 
    transactions: ParsedTransaction[], 
    onConfirmAll: () => void, 
    onRetry: () => void, 
    onClose: () => void,
    images: ImageInput[],
    onRemove: (index: number) => void,
    onUpdate: (index: number, data: ParsedTransaction) => void,
    isSaving: boolean
}) => {
    const { t } = useLanguage();
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const { findCategoryByName } = useCategories();
    const [duplicateInfo, setDuplicateInfo] = useState<Record<number, Transaction | null>>({});

    useEffect(() => {
        const checkDuplicates = async () => {
            const dups: Record<number, Transaction | null> = {};
            for (let i = 0; i < transactions.length; i++) {
                const tx = transactions[i];
                const found = await dataService.findPotentialDuplicate({
                    amount: tx.amount,
                    currency: tx.currency,
                    categoryId: findCategoryByName(tx.category)?.id,
                    date: tx.date ? new Date(tx.date) : undefined,
                    merchant: tx.merchant,
                    hashIdempotency: tx.hashIdempotency
                });
                dups[i] = found;
            }
            setDuplicateInfo(dups);
        };
        checkDuplicates();
    }, [transactions, findCategoryByName]);

    const grouped = useMemo(() => {
        const groups: Record<string, ParsedTransaction[]> = {};
        transactions.forEach(tx => {
            const gid = (tx as any).receiptGroupId || 'default';
            if (!groups[gid]) groups[gid] = [];
            groups[gid].push(tx);
        });
        return groups;
    }, [transactions]);

    const grandTotal = useMemo(() => {
        return transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    }, [transactions]);

    const handleSaveEdit = (data: Omit<Transaction, 'id' | 'userId'>) => {
        if (editingIndex !== null) {
            const categoryName = findCategoryByName(data.categoryId)?.name || 'Other';
            const originalTx = transactions[editingIndex];
            const updated: ParsedTransaction = {
                ...originalTx,
                transactionType: data.type,
                amount: data.amount,
                currency: data.currency,
                item: data.item,
                date: data.date.toISOString(),
                merchant: data.merchant || undefined,
                category: categoryName,
                kilometers: data.kilometers,
                receiptGroupId: (originalTx as any).receiptGroupId
            } as any;
            onUpdate(editingIndex, updated);
            setEditingIndex(null);
        }
    }

    const hasAnyDuplicates = Object.values(duplicateInfo).some(v => v !== null);

    return (
        <div className="flex flex-col h-full bg-[var(--bg-secondary)]">
            <div className="p-4 border-b border-[var(--border-primary-translucent)] flex justify-between items-center shrink-0">
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-[var(--text-white)]">Final Review</h2>
                    <p className="text-xs text-[var(--text-secondary)]">Verify and correct the extracted data.</p>
                </div>
                 <button onClick={onClose} disabled={isSaving} className="text-[var(--text-secondary)] hover:text-white p-1">
                    <X size={24} />
                </button>
            </div>
            
            {hasAnyDuplicates && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 p-3 flex items-center gap-3 shrink-0">
                    <ShieldAlert className="text-amber-500 shrink-0" size={18} />
                    <p className="text-[10px] text-amber-200 font-bold uppercase tracking-widest">
                        Reconciliation Alert - Some entries match existing bank or manual records.
                    </p>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {(Object.entries(grouped) as [string, ParsedTransaction[]][]).map(([gid, items], groupIdx) => {
                    const imgIds = gid.split(',').map(id => id.replace('receipt-', ''));
                    const gidImages = images.filter(img => imgIds.includes(img.id));
                    
                    // Check if group has a NULL merchant and try to heal from other items if possible
                    let displayMerchant = items.find(it => it.merchant && it.merchant.toLowerCase() !== 'null')?.merchant || 'Merchant Unknown';
                    
                    return (
                        <div key={gid} className="space-y-2">
                            <div className="flex items-center gap-2 px-1 mb-1">
                                 <div className="flex -space-x-2">
                                     {gidImages.map(img => (
                                         <div key={img.id} className="w-4 h-6 rounded bg-slate-700 overflow-hidden border border-slate-800">
                                             <img src={img.previewUrl} className="w-full h-full object-cover opacity-50" />
                                         </div>
                                     ))}
                                 </div>
                                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{displayMerchant}</span>
                            </div>
                            {items.map((tx, idx) => {
                                const globalIndex = transactions.indexOf(tx);
                                const duplicate = duplicateInfo[globalIndex];
                                const isDuplicate = !!duplicate;
                                
                                return (
                                    <div key={tx.id} className={`rounded-xl border ${isDuplicate ? 'border-amber-500/40 bg-amber-500/5' : 'border-[var(--border-primary)] bg-[var(--bg-tertiary)]'} overflow-hidden`}>
                                        {editingIndex === globalIndex ? (
                                            <div className="p-4">
                                                <TransactionForm
                                                    initialData={{
                                                        type: tx.transactionType,
                                                        amount: tx.amount,
                                                        currency: tx.currency,
                                                        date: tx.date ? new Date(tx.date) : new Date(),
                                                        item: tx.item,
                                                        merchant: tx.merchant || undefined,
                                                        categoryId: findCategoryByName(tx.category)?.id || '',
                                                        kilometers: tx.kilometers
                                                    }}
                                                    onSubmit={handleSaveEdit}
                                                    onCancel={() => setEditingIndex(null)}
                                                    submitButtonText="Update"
                                                />
                                            </div>
                                        ) : (
                                            <div className="p-3 flex items-center justify-between gap-4">
                                                <div className="flex items-center space-x-3 min-w-0">
                                                     <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[var(--bg-secondary)] ${isDuplicate ? 'text-amber-500' : 'text-[var(--accent-primary-light)]'}`}>
                                                        {isDuplicate ? <AlertCircle size={14} /> : <CategoryIcon categoryName={tx.category} />}
                                                     </div>
                                                     <div className="min-w-0">
                                                         <h4 className="font-bold text-xs text-white truncate">{tx.item}</h4>
                                                         <p className="text-[9px] text-slate-500 uppercase tracking-tight">
                                                            {tx.category} • {tx.merchant && tx.merchant.toLowerCase() !== 'null' ? tx.merchant : displayMerchant}
                                                            {tx.kilometers ? ` • ${tx.kilometers} KM` : ''}
                                                         </p>
                                                     </div>
                                                </div>
                                                <div className="flex items-center space-x-3 shrink-0">
                                                    <div className="text-right">
                                                        <p className="font-bold text-xs text-white">{tx.amount.toFixed(2)} <span className="text-[9px] opacity-40">{tx.currency}</span></p>
                                                        {isDuplicate && (
                                                            <span className="text-[8px] font-bold text-amber-500 uppercase">
                                                                Matches {duplicate.source === 'bank' ? 'Bank' : 'Ledger'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button onClick={() => setEditingIndex(globalIndex)} className="p-1.5 text-slate-400 hover:text-white"><Edit size={14} /></button>
                                                        <button onClick={() => onRemove(globalIndex)} className="p-1.5 text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            <div className="p-4 bg-[var(--bg-tertiary)] border-t border-[var(--border-primary-translucent)] shadow-inner">
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Grand Batch Total</span>
                    <span className="text-xl font-bold text-white font-mono">{grandTotal.toFixed(2)} <span className="text-xs opacity-50 uppercase">{transactions[0]?.currency}</span></span>
                 </div>
                 <div className="flex gap-3">
                    <button onClick={onRetry} disabled={isSaving} className="flex-1 py-3 bg-slate-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest disabled:opacity-50">Reset</button>
                    <button onClick={onConfirmAll} disabled={isSaving} className="flex-[2] py-4 bg-[var(--positive)] text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                        {isSaving ? 'Saving Records...' : 'Save All Records'}
                    </button>
                 </div>
            </div>
        </div>
    );
};

const CategoryIcon = ({ categoryName }: { categoryName: string }) => {
    const { findCategoryByName } = useCategories();
    const category = findCategoryByName(categoryName);
    const Icon = getIconComponent(category?.icon);
    return <Icon size={14} />;
};

const ErrorView = ({ error, onRetry, onClose }: { error: string, onRetry: () => void, onClose: () => void }) => {
    return (
        <div className="p-8 text-center flex flex-col items-center justify-center h-full relative">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-[var(--text-tertiary)] hover:text-white hover:bg-[var(--bg-tertiary)] rounded-full transition-colors z-10"
            >
                <X size={20} />
            </button>
            <AlertTriangle className="text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-white mb-2">Analysis Failed</h2>
            <p className="text-slate-400 text-sm mb-6">{error}</p>
            <button onClick={onRetry} className="px-8 py-3 bg-[var(--accent-primary)] text-white rounded-xl font-bold">Try Again</button>
        </div>
    );
};

export default ReceiptProcessor;
