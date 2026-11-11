
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Building2, 
    RefreshCw, 
    ArrowUpRight, 
    Link as LinkIcon, 
    ShieldCheck, 
    AlertCircle, 
    ChevronRight,
    Plus,
    CreditCard,
    CheckCircle2,
    Loader2,
    Database,
    Lock,
    Trash2
} from 'lucide-react';
import { BankConnection, BankAccount } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import LegalScreen from './LegalScreen';
import { TwoFactorSetupModal } from './SecuritySettings';
import { authFetch } from '../services/apiService';

const BankConnectivity: React.FC = () => {
    const { hasFeature, account } = useAuth();
    const [mfaStep, setMfaStep] = useState<'prompt' | 'setup' | null>(null);
    const [connections, setConnections] = useState<BankConnection[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncingId, setSyncingId] = useState<string | null>(null);
    const [pushingId, setPushingId] = useState<string | null>(null);
    const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
    const [showLegal, setShowLegal] = useState(false);
    const [disconnectTarget, setDisconnectTarget] = useState<string | null>(null);
    const [purgeLedger, setPurgeLedger] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const { addToast } = useNotification();
    const { t } = useLanguage();

    if (!hasFeature('BANK_SYNC')) {
        return (
            <div className="p-6 max-w-5xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight">{t('bank.title')}</h1>
                    <p className="text-[var(--text-tertiary)] mt-1">{t('bank.description')}</p>
                </header>

                <div className="bg-[var(--bg-secondary)] p-12 rounded-2xl border border-dashed border-[var(--border-primary)] text-center space-y-4">
                    <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center text-[var(--text-tertiary)] mx-auto">
                        <Lock size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{t('subscription.premiumFeature')}</h3>
                        <p className="text-sm text-[var(--text-tertiary)] max-w-xs mx-auto">{t('subscription.upgradeRequired')}</p>
                    </div>
                </div>
            </div>
        );
    }

    const fetchConnections = async () => {
        try {
            const res = await authFetch('/bank/connections');
            if (res.ok) {
                const data = await res.json();
                setConnections(data);
            }
        } catch (error) {
            console.error('Failed to fetch connections', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAccounts = async (connectionId: string) => {
        try {
            const res = await authFetch(`/bank/connections/${connectionId}/accounts`);
            if (res.ok) {
                const data = await res.json();
                setAccounts(data);
            }
        } catch (error) {
            console.error('Failed to fetch accounts', error);
        }
    };

    useEffect(() => {
        fetchConnections();
    }, []);

    useEffect(() => {
        if (selectedConnection) {
            fetchAccounts(selectedConnection);
        } else {
            setAccounts([]);
        }
    }, [selectedConnection]);

    const handleAddConnection = async () => {
        // Bank access requires two-factor sign-in (also enforced by the server).
        if (!account?.mfaEnabled) {
            setMfaStep('prompt');
            return;
        }
        // Mocking the Plaid/Bank Link flow
        addToast(t('bank.initializing'), "info");
        
        try {
            // 1. Get link token
            const ltRes = await authFetch('/bank/link-token', {
                method: 'POST'
            });
            const { link_token } = await ltRes.json();
            
            // 2. Simulate user finishing link flow and getting public token
            // In a real app, this would be handled by the Plaid SDK
            const public_token = `public-mock-${Math.random().toString(36).substring(7)}`;
            
            // 3. Exchange public token
            const exRes = await authFetch('/bank/exchange-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ public_token })
            });
            
            if (exRes.ok) {
                addToast(t('bank.connectedSuccess'), "success");
                fetchConnections();
            }
        } catch (error) {
            addToast(t('bank.connectFailed'), "error");
        }
    };

    const handleSync = async (connectionId: string) => {
        setSyncingId(connectionId);
        try {
            const res = await authFetch('/bank/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ connection_id: connectionId })
            });
            
            if (res.ok) {
                const result = await res.json();
                addToast(t('bank.syncComplete', { count: result.transactions_count }), "success");
                fetchConnections();
                if (selectedConnection === connectionId) fetchAccounts(connectionId);
            }
        } catch (error) {
            addToast(t('bank.syncFailed'), "error");
        } finally {
            setSyncingId(null);
        }
    };

    const handlePushToLedger = async (connectionId: string) => {
        setPushingId(connectionId);
        try {
            const res = await authFetch('/bank/push-to-ledger', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ connection_id: connectionId })
            });
            
            if (res.ok) {
                const result = await res.json();
                addToast(t('bank.ledgerUpdated', { count: result.result.summary.inserted }), "success");
            } else {
                const err = await res.json();
                addToast(t('bank.pushFailed', { error: err.error }), "error");
            }
        } catch (error) {
            addToast(t('bank.pushFailed', { error: 'Unknown error' }), "error");
        } finally {
            setPushingId(null);
        }
    };

    const handleDisconnect = async () => {
        if (!disconnectTarget) return;
        setDisconnecting(true);
        try {
            const res = await authFetch(`/bank/connections/${disconnectTarget}?purgeLedger=${purgeLedger}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                addToast(t('bank.disconnected'), "success");
                if (selectedConnection === disconnectTarget) setSelectedConnection(null);
                setDisconnectTarget(null);
                setPurgeLedger(false);
                fetchConnections();
            } else {
                addToast(t('bank.disconnectFailed'), "error");
            }
        } catch (error) {
            addToast(t('bank.disconnectFailed'), "error");
        } finally {
            setDisconnecting(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('bank.title')}</h1>
                    <p className="text-[var(--text-tertiary)] mt-1">{t('bank.description')}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary-translucent)]">
                        <input 
                            type="checkbox" 
                            id="bank-terms" 
                            checked={hasAcceptedTerms}
                            onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                            className="w-4 h-4 rounded border-[var(--border-primary)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] cursor-pointer"
                        />
                        <label htmlFor="bank-terms" className="text-[10px] text-[var(--text-secondary)] cursor-pointer">
                            I agree to the <button onClick={() => setShowLegal(true)} className="text-[var(--accent-primary)] font-bold hover:underline">Terms</button> & <button onClick={() => setShowLegal(true)} className="text-[var(--accent-primary)] font-bold hover:underline">Privacy Policy</button>
                        </label>
                    </div>
                    <button 
                        onClick={handleAddConnection}
                        disabled={!hasAcceptedTerms}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-[var(--text-contrast)] rounded-xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent-primary-shadow)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={20} />
                        {t('bank.addConnection')}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Connections List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">{t('bank.activeConnections')}</h2>
                        <span className="text-[10px] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full text-[var(--text-secondary)] font-mono">
                            {connections.length} {t('bank.total')}
                        </span>
                    </div>

                    {loading ? (
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary-translucent)] rounded-2xl p-12 flex flex-col items-center justify-center text-[var(--text-tertiary)]">
                            <Loader2 className="animate-spin mb-4" size={32} />
                            <p className="font-mono text-sm">{t('bank.loadingLayer')}</p>
                        </div>
                    ) : connections.length === 0 ? (
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary-translucent)] rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center text-[var(--text-tertiary)]">
                                <Building2 size={32} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{t('bank.noConnections')}</h3>
                                <p className="text-sm text-[var(--text-tertiary)] max-w-xs mx-auto">{t('bank.connectDescription')}</p>
                            </div>
                            <button 
                                onClick={handleAddConnection}
                                className="text-[var(--accent-primary)] font-bold text-sm hover:underline"
                            >
                                {t('bank.getStarted')} &rarr;
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {connections.map((conn) => (
                                <div 
                                    key={conn.id}
                                    className={`group relative bg-[var(--bg-secondary)] border transition-all rounded-2xl overflow-hidden ${selectedConnection === conn.id ? 'border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]' : 'border-[var(--border-primary-translucent)] hover:border-[var(--text-tertiary)]'}`}
                                >
                                    <div className="p-5 flex items-start justify-between">
                                        <div className="flex gap-4 cursor-pointer flex-grow" onClick={() => setSelectedConnection(conn.id)}>
                                            <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center text-[var(--text-primary)] shrink-0">
                                                <Building2 size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-lg capitalize">{conn.providerName} {t('bank.connection')}</h3>
                                                    {conn.status === 'active' ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
                                                            <CheckCircle2 size={10} /> {t('bank.active')}
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full uppercase">
                                                            <AlertCircle size={10} /> {conn.status}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-[var(--text-tertiary)] font-mono mt-0.5">ID: {conn.id.substring(0, 8)}... • Updated {new Date(conn.updatedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleSync(conn.id)}
                                                disabled={syncingId === conn.id}
                                                className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors text-[var(--text-secondary)] disabled:opacity-50"
                                                title={t('bank.syncTransactions')}
                                            >
                                                <RefreshCw size={18} className={syncingId === conn.id ? 'animate-spin' : ''} />
                                            </button>
                                            <button 
                                                onClick={() => handlePushToLedger(conn.id)}
                                                disabled={pushingId === conn.id}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] border border-[var(--border-primary-translucent)] rounded-lg transition-all text-xs font-bold disabled:opacity-50"
                                            >
                                                {pushingId === conn.id ? <Loader2 size={14} className="animate-spin" /> : <ArrowUpRight size={14} />}
                                                {t('bank.pushToLedger')}
                                            </button>
                                            <button 
                                                onClick={() => setDisconnectTarget(conn.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-[var(--text-secondary)] hover:text-red-500"
                                                title={t('bank.disconnect')}
                                                aria-label={t('bank.disconnect')}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {selectedConnection === conn.id && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            className="border-t border-[var(--border-primary-translucent)] bg-[var(--bg-tertiary)]/30"
                                        >
                                            <div className="p-5 space-y-3">
                                                <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">{t('bank.linkedAccounts')}</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {accounts.map(acc => (
                                                        <div key={acc.id} className="bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-primary-translucent)] flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-tertiary)]">
                                                                    <CreditCard size={16} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold">{acc.name}</p>
                                                                    <p className="text-[10px] text-[var(--text-tertiary)] uppercase">{acc.type} • {acc.currency} • ****{acc.maskLast4}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary-gradient-to)] rounded-2xl p-6 text-[var(--text-contrast)] shadow-xl shadow-[var(--accent-primary-shadow)]">
                        <div className="w-12 h-12 bg-[var(--text-contrast)]/20 rounded-xl flex items-center justify-center mb-4">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-2">{t('bank.secureSyncLayer')}</h3>
                        <p className="text-sm text-[var(--text-contrast)]/80 leading-relaxed">
                            {t('bank.secureSyncDesc')}
                        </p>
                        <div className="mt-6 pt-6 border-t border-[var(--text-contrast)]/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{t('bank.systemStatus')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary-translucent)] rounded-2xl p-6 space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <Database size={18} className="text-[var(--accent-primary)]" />
                            {t('bank.ingestionRules')}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="w-1 h-1 bg-[var(--accent-primary)] rounded-full mt-2 shrink-0"></div>
                                <p className="text-xs text-[var(--text-secondary)]"><span className="font-bold text-[var(--text-primary)]">{t('bank.idempotency')}:</span> {t('bank.idempotencyDesc')}</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-1 h-1 bg-[var(--accent-primary)] rounded-full mt-2 shrink-0"></div>
                                <p className="text-xs text-[var(--text-secondary)]"><span className="font-bold text-[var(--text-primary)]">{t('bank.autoCategorization')}:</span> {t('bank.autoCategorizationDesc')}</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-1 h-1 bg-[var(--accent-primary)] rounded-full mt-2 shrink-0"></div>
                                <p className="text-xs text-[var(--text-secondary)]"><span className="font-bold text-[var(--text-primary)]">{t('bank.reviewQueue')}:</span> {t('bank.reviewQueueDesc')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Legal Overlay */}
            <AnimatePresence>
                {showLegal && (
                    <motion.div 
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-50"
                    >
                        <LegalScreen onBack={() => setShowLegal(false)} />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {mfaStep === 'setup' && (
                    <TwoFactorSetupModal onClose={() => setMfaStep(null)} />
                )}
                {mfaStep === 'prompt' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
                        onClick={() => setMfaStep(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            role="dialog"
                            aria-modal="true"
                            className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-primary-translucent)] rounded-2xl p-6 space-y-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--accent-primary-light)]">
                                    <ShieldCheck size={22} />
                                </div>
                                <h3 className="font-bold text-lg">{t('bank.mfaRequiredTitle')}</h3>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)]">
                                {account ? t('bank.mfaRequiredBody') : t('security.offline')}
                            </p>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setMfaStep(null)}
                                    className="px-4 py-2 rounded-xl text-sm font-bold hover:bg-[var(--bg-tertiary)]"
                                >
                                    {t('bank.cancel')}
                                </button>
                                {account && (
                                    <button
                                        onClick={() => setMfaStep('setup')}
                                        className="px-4 py-2 rounded-xl text-sm font-bold bg-[var(--accent-primary)] text-white hover:opacity-90"
                                    >
                                        {t('bank.mfaSetup')}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                {disconnectTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
                        onClick={() => !disconnecting && setDisconnectTarget(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            role="dialog"
                            aria-modal="true"
                            className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-primary-translucent)] rounded-2xl p-6 space-y-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="font-bold text-lg">{t('bank.disconnectTitle')}</h3>
                            <p className="text-sm text-[var(--text-secondary)]">{t('bank.disconnectBody')}</p>
                            <label className="flex items-start gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={purgeLedger}
                                    onChange={(e) => setPurgeLedger(e.target.checked)}
                                    className="mt-0.5 w-4 h-4 rounded"
                                />
                                <span>{t('bank.disconnectPurgeLedger')}</span>
                            </label>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => { setDisconnectTarget(null); setPurgeLedger(false); }}
                                    disabled={disconnecting}
                                    className="px-4 py-2 rounded-xl text-sm font-bold hover:bg-[var(--bg-tertiary)] disabled:opacity-50"
                                >
                                    {t('bank.cancel')}
                                </button>
                                <button
                                    onClick={handleDisconnect}
                                    disabled={disconnecting}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    {disconnecting && <Loader2 size={14} className="animate-spin" />}
                                    {t('bank.disconnect')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BankConnectivity;
