
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction } from '../types';
import TransactionForm from './TransactionForm';
import { useLanguage } from '../contexts/LanguageContext';
import { Download, Trash2, Camera, UploadCloud, X, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import CameraCapture from './CameraCapture';
import { blobToBase64 } from '../utils/helpers';

interface EditTransactionProps {
    transaction: Transaction;
    onClose: () => void;
    onSave: (transaction: Transaction) => void;
}

const EditTransaction: React.FC<EditTransactionProps> = ({ transaction, onClose, onSave }) => {
    const { t } = useLanguage();
    const [receiptImages, setReceiptImages] = useState<string[]>(transaction.receiptImages || []);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);
    
    const handleSubmit = (formData: Omit<Transaction, 'id' | 'userId'>) => {
        onSave({
            ...transaction,
            ...formData,
            receiptImages: receiptImages.length > 0 ? receiptImages : undefined
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const base64 = await blobToBase64(file);
                setReceiptImages(prev => [...prev, base64]);
            } catch (err) {
                console.error("Failed to upload file", err);
            }
        }
    };

    const handleCapture = async (blob: Blob) => {
        try {
            const base64 = await blobToBase64(blob);
            setReceiptImages(prev => [...prev, base64]);
            setIsCameraOpen(false);
        } catch (err) {
            console.error("Failed to capture image", err);
        }
    };

    const handleRemoveImage = (index: number) => {
        setReceiptImages(prev => prev.filter((_, i) => i !== index));
        if (viewerIndex === index) setViewerIndex(null);
        else if (viewerIndex !== null && viewerIndex > index) setViewerIndex(viewerIndex - 1);
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (viewerIndex !== null && viewerIndex < receiptImages.length - 1) {
            setViewerIndex(viewerIndex + 1);
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (viewerIndex !== null && viewerIndex > 0) {
            setViewerIndex(viewerIndex - 1);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border-primary-translucent)] max-h-[90vh] overflow-hidden flex flex-col"
            >
                {isCameraOpen ? (
                    <CameraCapture onCapture={handleCapture} onCancel={() => setIsCameraOpen(false)} />
                ) : (
                    <div className="p-6 overflow-y-auto">
                        <h2 className="text-xl font-bold text-[var(--text-white)] text-center mb-4">{t('common.edit')} Transaction</h2>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('common.receipt')}</label>
                            
                            {receiptImages.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                                    {receiptImages.map((img, idx) => (
                                        <div 
                                            key={`receipt-${idx}-${img.substring(0, 32)}`} 
                                            onClick={() => setViewerIndex(idx)}
                                            className="relative w-24 h-32 flex-shrink-0 bg-[var(--bg-tertiary)] rounded-lg overflow-hidden border border-[var(--border-primary)] group cursor-pointer"
                                        >
                                            <img 
                                                src={`data:image/jpeg;base64,${img}`} 
                                                alt={`Receipt ${idx + 1}`} 
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                <Maximize2 size={20} className="text-white mb-1" />
                                                <div className="flex gap-1">
                                                    <a 
                                                        href={`data:image/jpeg;base64,${img}`} 
                                                        download={`receipt-${idx + 1}.jpg`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-1.5 bg-white/20 rounded-full text-white hover:bg-white/40"
                                                    >
                                                        <Download size={14} />
                                                    </a>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                                                        className="p-1.5 bg-red-500/50 rounded-full text-white hover:bg-red-500/70"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsCameraOpen(true)}
                                    className="flex flex-col items-center justify-center p-4 bg-[var(--bg-tertiary)] rounded-xl border-2 border-dashed border-[var(--border-primary)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-interactive-hover)] transition-all group"
                                >
                                    <Camera size={20} className="text-[var(--text-tertiary)] group-hover:text-[var(--accent-primary-light)] mb-1" />
                                    <span className="text-[10px] font-bold text-[var(--text-secondary)]">{t('receiptProcessor.takePhoto')}</span>
                                </button>
                                
                                <label className="flex flex-col items-center justify-center p-4 bg-[var(--bg-tertiary)] rounded-xl border-2 border-dashed border-[var(--border-primary)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-interactive-hover)] transition-all cursor-pointer group">
                                    <UploadCloud size={20} className="text-[var(--text-tertiary)] group-hover:text-[var(--accent-primary-light)] mb-1" />
                                    <span className="text-[10px] font-bold text-[var(--text-secondary)]">{t('receiptProcessor.uploadFile')}</span>
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </label>
                            </div>
                        </div>

                        <TransactionForm
                            initialData={transaction}
                            onSubmit={handleSubmit}
                            onCancel={onClose}
                            submitButtonText={t('transactionForm.saveChanges')}
                        />
                    </div>
                )}
            </motion.div>

            {/* FULL SCREEN IMAGE VIEWER */}
            <AnimatePresence>
                {viewerIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center"
                        onClick={() => setViewerIndex(null)}
                    >
                        <div className="absolute top-6 left-0 right-0 px-6 flex justify-between items-center text-white z-10">
                            <span className="text-sm font-medium opacity-70">{viewerIndex + 1} / {receiptImages.length}</span>
                            <div className="flex gap-4">
                                <a 
                                    href={`data:image/jpeg;base64,${receiptImages[viewerIndex]}`} 
                                    download={`receipt-${viewerIndex + 1}.jpg`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <Download size={24} />
                                </a>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleRemoveImage(viewerIndex); }}
                                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-full transition-colors"
                                >
                                    <Trash2 size={24} />
                                </button>
                                <button 
                                    onClick={() => setViewerIndex(null)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {receiptImages.length > 1 && (
                            <>
                                <button 
                                    onClick={prevImage}
                                    disabled={viewerIndex === 0}
                                    className="absolute left-4 p-4 text-white hover:bg-white/10 rounded-full disabled:opacity-20 transition-all z-10"
                                >
                                    <ChevronLeft size={48} />
                                </button>
                                <button 
                                    onClick={nextImage}
                                    disabled={viewerIndex === receiptImages.length - 1}
                                    className="absolute right-4 p-4 text-white hover:bg-white/10 rounded-full disabled:opacity-20 transition-all z-10"
                                >
                                    <ChevronRight size={48} />
                                </button>
                            </>
                        )}

                        <motion.img
                            key={viewerIndex}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={`data:image/jpeg;base64,${receiptImages[viewerIndex]}`}
                            className="max-w-[90vw] max-h-[80vh] object-contain shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default EditTransaction;
