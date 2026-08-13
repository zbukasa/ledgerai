
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, AlertTriangle, Loader2, RefreshCw, CheckCircle, Search, Edit, Plus } from 'lucide-react';
import { Transaction, VoiceCommand } from '../types';
import { useVoiceProcessor } from '../hooks/useVoiceProcessor';
import TransactionForm from './TransactionForm';
import { useLanguage } from '../contexts/LanguageContext';
import { HapticService } from '../services/hapticService';
import { Capacitor } from '@capacitor/core';

interface VoiceEntryProps {
    onClose: () => void;
    onCommand: (command: VoiceCommand) => void;
    onManualEntry?: () => void;
}

const VoiceEntry: React.FC<VoiceEntryProps> = ({ onClose, onCommand, onManualEntry }) => {
    const {
        recordingState,
        transcription,
        intent,
        error,
        startRecording,
        stopRecording,
        handleRetry,
    } = useVoiceProcessor();
    const { t } = useLanguage();
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        if (intent && (intent.type === 'edit' || intent.type === 'filter' || intent.type === 'trip' || intent.type === 'currency' || intent.type === 'language' || intent.type === 'production')) {
            let message = '';
            if (intent.type === 'edit') message = t('voiceEntry.editingLastTransaction');
            else if (intent.type === 'filter') message = t('voiceEntry.applyingFilters');
            else if (intent.type === 'trip') message = intent.data.action === 'start' ? 'Starting Trip Tracking...' : 'Stopping Trip Tracking...';
            else if (intent.type === 'currency') message = `Changing currency to ${intent.data.currency}...`;
            else if (intent.type === 'language') {
                const langNames: { [key: string]: string } = { en: 'English', fr: 'French', ln: 'Lingala', sw: 'Swahili' };
                message = `Changing language to ${langNames[intent.data.language]}...`;
            }
            else if (intent.type === 'production') {
                message = `Recording production of ${intent.data.quantity} ${intent.data.productType}...`;
            }
            
            setStatusMessage(message);
            HapticService.notificationSuccess();
            onCommand(intent);
            setTimeout(() => {
                onClose();
            }, 1500); // Close modal after showing status
        }
    }, [intent, onCommand, onClose, t]);


    // Fix: Updated data type for handleConfirm
    const handleConfirm = (data: Omit<Transaction, 'id' | 'userId'>) => {
        HapticService.impactMedium();
        onCommand({ type: 'create', data });
        HapticService.notificationSuccess();
    };

    const renderContent = () => {
        if (statusMessage) {
            let Icon = CheckCircle;
            if (intent?.type === 'edit') Icon = Edit;
            if (intent?.type === 'filter') Icon = Search;
            return <StatusView message={statusMessage} icon={Icon} />;
        }

        switch (recordingState) {
            case 'connecting':
                return <ConnectingView />;
            case 'recording':
                return <RecordingView stopRecording={stopRecording} transcription={transcription} />;
            case 'processing':
                return <ProcessingView transcription={transcription} />;
            case 'confirming':
                 if (intent?.type === 'create') {
                    return <ConfirmationView transcription={transcription} transaction={intent.data} onSave={handleConfirm} onRetry={handleRetry} onClose={onClose} />;
                }
                // Edit/Filter are handled by useEffect, but as a fallback:
                return <ProcessingView transcription={transcription} />;
            case 'error':
                return <ErrorView error={error || t('voiceEntry.unknownError')} onRetry={handleRetry} />;
            case 'idle':
            default:
                return <IdleView startRecording={startRecording} onManualEntry={onManualEntry} />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={statusMessage ? undefined : onClose} // Don't close on background click if showing status
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-[var(--bg-secondary)]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-[var(--border-primary-translucent)]"
            >
                {renderContent()}
            </motion.div>
        </motion.div>
    );
};

// --- Sub-components for different states ---
const StatusView = ({ message, icon: Icon }: { message: string, icon: React.ElementType }) => (
    <div className="p-8 text-center flex flex-col items-center justify-center h-48">
        <Icon className="text-[var(--accent-primary-light)] mb-4" size={40} />
        <h2 className="text-xl font-bold text-[var(--text-white)]">{message}</h2>
    </div>
);

const ConnectingView = () => {
    const { t } = useLanguage();
    return (
        <div className="p-8 text-center flex flex-col items-center justify-center h-48">
            <Loader2 className="animate-spin text-[var(--accent-primary-light)] mb-4" size={40} />
            <h2 className="text-xl font-bold text-[var(--text-white)]">{t('voiceEntry.connecting') || 'Connecting...'}</h2>
        </div>
    );
};

const IdleView = ({ startRecording, onManualEntry }: { startRecording: () => void, onManualEntry?: () => void }) => {
    const { t } = useLanguage();
    const [permError, setPermError] = useState<string | null>(null);

    const handleStartRecording = async () => {
        HapticService.impactMedium();
        setPermError(null);

        // On native Android, request microphone permission via browser API
        // (Capacitor WebView respects navigator.permissions on Android 6+)
        if (Capacitor.isNativePlatform()) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                // Permission granted — stop the test stream immediately
                stream.getTracks().forEach(track => track.stop());
            } catch (err) {
                setPermError('Microphone access denied. Please enable it in your device Settings.');
                return;
            }
        }

        startRecording();
    };

    return (
        <div className="p-6 text-center">
            <h2 className="text-xl font-bold text-[var(--text-white)]">{t('voiceEntry.title')}</h2>
            <p className="text-[var(--text-secondary)] mt-2 mb-6">{t('voiceEntry.prompt')}</p>

            {permError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    {permError}
                </div>
            )}

            <div className="flex flex-col items-center gap-6">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStartRecording}
                    className="w-20 h-20 bg-gradient-to-br from-[var(--accent-primary-gradient-from)] to-[var(--accent-primary-gradient-to)] rounded-full flex items-center justify-center text-white shadow-lg"
                    style={{ boxShadow: `0 8px 20px var(--accent-primary-shadow)` }}
                >
                    <Mic size={40} />
                </motion.button>

                {onManualEntry && (
                    <button 
                        onClick={onManualEntry}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-interactive-hover)] transition-colors border border-[var(--border-primary-translucent)]"
                    >
                        <Plus size={18} className="text-[var(--accent-primary-light)]" />
                        <span className="text-sm font-semibold">{t('common.add')} Manually</span>
                    </button>
                )}
            </div>

            <div className="text-left mt-8 text-sm text-[var(--text-secondary)]">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">{t('voiceEntry.trySaying')}</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li>"{t('voiceEntry.example1')}"</li>
                    <li>"{t('voiceEntry.example2')}"</li>
                    <li>"{t('voiceEntry.example3')}"</li>
                    <li>"Change currency to Euro"</li>
                </ul>
            </div>
        </div>
    );
};

const RecordingView = ({ stopRecording, transcription }: { stopRecording: () => void, transcription: string }) => {
    const { t } = useLanguage();
    return (
        <div className="p-6 text-center">
            <h2 className="text-xl font-bold text-[var(--text-white)]">{t('voiceEntry.listening')}</h2>
            <div className="h-24 my-4 flex items-center justify-center">
                <div className="w-full bg-[var(--bg-tertiary)]/50 rounded-xl p-4 min-h-[5rem] text-[var(--text-primary)] text-center flex items-center justify-center border border-[var(--border-primary-translucent)]">
                    {transcription || <span className="text-[var(--text-tertiary)] italic">...</span>}
                </div>
            </div>
            <div className="relative flex justify-center items-center">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.2, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute w-24 h-24 bg-[var(--negative)]/50 rounded-full"
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        HapticService.impactMedium();
                        stopRecording();
                    }}
                    className="relative w-20 h-20 bg-gradient-to-br from-[var(--negative)] to-[var(--negative)]/80 rounded-full flex items-center justify-center text-white shadow-lg shadow-[var(--negative)]/30 z-10"
                >
                    <div className="w-8 h-8 bg-[var(--text-white)] rounded-sm"></div>
                </motion.button>
            </div>
            <p className="mt-6 text-xs text-[var(--text-secondary)] uppercase tracking-widest">{t('voiceEntry.tapToStop')}</p>
        </div>
    );
};

const ProcessingView = ({ transcription }: { transcription: string }) => {
    const { t } = useLanguage();
    return (
        <div className="p-6 text-center">
            <h2 className="text-xl font-bold text-[var(--text-white)]">{t('voiceEntry.processing')}</h2>
            <div className="h-20 my-4 flex items-center justify-center text-[var(--text-primary)]">
                "{transcription}"
            </div>
            <div className="flex justify-center">
                <Loader2 className="animate-spin text-[var(--accent-primary-light)]" size={48} />
            </div>
        </div>
    );
};

// Fix: Updated transaction type in ConfirmationView props
const ConfirmationView = ({ transcription, transaction, onSave, onRetry, onClose }: {
    transcription: string,
    transaction: Omit<Transaction, 'id' | 'userId'>,
    onSave: (tx: Omit<Transaction, 'id' | 'userId'>) => void,
    onRetry: () => void,
    onClose: () => void
}) => {
    const { t } = useLanguage();
    return (
        <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-[var(--text-white)] text-center">{t('voiceEntry.reviewAndEdit')}</h2>
            <div className="bg-[var(--bg-tertiary)]/50 rounded-lg p-3 text-center italic text-[var(--text-primary)] text-sm">
                "{transcription}"
            </div>
            <TransactionForm
                initialData={transaction}
                onSubmit={onSave}
                onCancel={onClose}
                onRetry={onRetry}
                submitButtonText={t('common.save')}
                retryButtonText={t('common.tryAgain')}
            />
        </div>
    );
};

const ErrorView = ({ error, onRetry }: { error: string, onRetry: () => void }) => {
    const { t } = useLanguage();
    return (
        <div className="p-6 text-center">
            <AlertTriangle className="mx-auto text-[var(--warning-text)]" size={40} />
            <h2 className="text-xl font-bold text-[var(--text-white)] mt-4">{t('voiceEntry.oops')}</h2>
            <p className="text-[var(--text-primary)] my-2">{error}</p>
            <button onClick={() => {
                HapticService.notificationError();
                onRetry();
            }} className="mt-4 px-6 py-2 rounded-lg bg-[var(--accent-primary)] text-[var(--text-contrast)] hover:opacity-90 font-semibold transition-opacity flex items-center mx-auto space-x-2">
                <RefreshCw size={16} />
                <span>{t('common.tryAgain')}</span>
            </button>
        </div>
    );
};

export default VoiceEntry;
