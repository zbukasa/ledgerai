import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, Download, KeyRound, Loader2, ShieldCheck, ShieldOff, Trash2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { apiService } from '../services/apiService';
import { inputClass, useAuthErrorMessage } from './AuthScreen';

const primaryButtonClass = "w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--accent-primary)] text-white font-bold rounded-xl hover:brightness-110 shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed";
const dangerButtonClass = "w-full flex items-center justify-center gap-2 py-3.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed";

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; locked?: boolean }> = ({ title, onClose, children, locked }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => !locked && onClose()}
    >
        <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-[var(--bg-secondary)] border border-[var(--border-primary-translucent)] rounded-3xl shadow-2xl"
            onClick={e => e.stopPropagation()}
        >
            <div className="p-5 border-b border-[var(--border-primary-translucent)] flex justify-between items-center">
                <h2 className="text-lg font-bold text-[var(--text-white)]">{title}</h2>
                {!locked && <button onClick={onClose} aria-label="Close"><X className="text-[var(--text-secondary)]" /></button>}
            </div>
            <div className="p-6 space-y-5">{children}</div>
        </motion.div>
    </motion.div>
);

const CodeInput: React.FC<{ value: string; onChange: (v: string) => void; allowRecovery?: boolean; label: string }> = ({ value, onChange, allowRecovery, label }) => (
    <input
        aria-label={label}
        value={value}
        onChange={e => onChange(allowRecovery ? e.target.value.toUpperCase() : e.target.value.replace(/\D/g, '').slice(0, 6))}
        inputMode={allowRecovery ? 'text' : 'numeric'}
        autoComplete="one-time-code"
        placeholder={allowRecovery ? '123456 / XXXX-XXXX-XXXX' : '123456'}
        className={`${inputClass} bg-[var(--bg-primary)] text-center text-xl tracking-[0.25em] font-mono`}
    />
);

const copyText = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
};

/** Turn on two-factor: show the secret, confirm a first code, then show recovery codes once. */
export const TwoFactorSetupModal: React.FC<{ onClose: () => void; onEnabled?: () => void }> = ({ onClose, onEnabled }) => {
    const { refreshAccount } = useAuth();
    const { t } = useLanguage();
    const { addToast } = useNotification();
    const errorMessage = useAuthErrorMessage();

    const [setup, setSetup] = useState<{ secret: string; otpauth_url: string; qr_data_url: string } | null>(null);
    const [code, setCode] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [copied, setCopied] = useState<'key' | 'codes' | null>(null);

    // Each setup call replaces the pending secret, so run it once even under StrictMode.
    const started = useRef(false);
    useEffect(() => {
        if (started.current) return;
        started.current = true;
        apiService.auth.mfaSetup()
            .then(setSetup)
            .catch(e => setError(errorMessage(e)));
    }, []);

    const markCopied = async (what: 'key' | 'codes', text: string) => {
        if (await copyText(text)) {
            setCopied(what);
            setTimeout(() => setCopied(null), 2000);
        }
    };

    const handleEnable = async () => {
        setBusy(true);
        setError(null);
        try {
            const result = await apiService.auth.mfaEnable(code);
            setRecoveryCodes(result.recovery_codes);
            await refreshAccount().catch(() => undefined);
        } catch (e) {
            setError(errorMessage(e));
        } finally {
            setBusy(false);
        }
    };

    const downloadCodes = () => {
        const blob = new Blob([`LedgerAI recovery codes\n\n${recoveryCodes!.join('\n')}\n`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ledgerai-recovery-codes.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const finish = () => {
        addToast(t('security.enabled'), 'success');
        onEnabled?.();
        onClose();
    };

    if (recoveryCodes) {
        return (
            <Modal title={t('security.recoveryTitle')} onClose={finish} locked>
                <p className="text-sm text-[var(--text-secondary)]">{t('security.recoveryBody')}</p>
                <div className="grid grid-cols-2 gap-2 p-4 rounded-xl bg-[var(--bg-primary)] font-mono text-sm text-center">
                    {recoveryCodes.map(c => <span key={c}>{c}</span>)}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => markCopied('codes', recoveryCodes.join('\n'))} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--bg-tertiary)] text-sm font-bold">
                        {copied === 'codes' ? <Check size={16} /> : <Copy size={16} />}
                        {copied === 'codes' ? t('security.copied') : t('security.copyAll')}
                    </button>
                    <button onClick={downloadCodes} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--bg-tertiary)] text-sm font-bold">
                        <Download size={16} />
                        {t('security.download')}
                    </button>
                </div>
                <button onClick={finish} className={primaryButtonClass}>{t('security.savedCodes')}</button>
            </Modal>
        );
    }

    return (
        <Modal title={t('security.setupTitle')} onClose={onClose}>
            <ol className="space-y-5 text-sm text-[var(--text-secondary)]">
                <li>
                    <span className="font-bold text-[var(--text-primary)]">1. </span>
                    {t('security.setupStep1')}
                </li>
                <li className="space-y-3">
                    <p><span className="font-bold text-[var(--text-primary)]">2. </span>{t('security.setupStep2')}</p>
                    {!setup && !error && (
                        <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
                    )}
                    {setup && (
                        <>
                            <div className="flex justify-center">
                                <img src={setup.qr_data_url} alt="QR code" width={200} height={200} className="rounded-xl bg-white p-2" />
                            </div>
                            <a href={setup.otpauth_url} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--bg-tertiary)] text-sm font-bold text-[var(--text-primary)]">
                                <KeyRound size={16} />
                                {t('security.openApp')}
                            </a>
                            <div>
                                <p className="text-xs mb-1">{t('security.manualKey')}</p>
                                <button
                                    onClick={() => markCopied('key', setup.secret)}
                                    className="w-full flex items-center justify-between gap-2 p-3 rounded-xl bg-[var(--bg-primary)] font-mono text-xs text-[var(--text-primary)] break-all text-left"
                                >
                                    <span>{setup.secret.match(/.{1,4}/g)?.join(' ')}</span>
                                    {copied === 'key' ? <Check size={16} className="shrink-0" /> : <Copy size={16} className="shrink-0" />}
                                </button>
                            </div>
                        </>
                    )}
                </li>
                <li className="space-y-3">
                    <p><span className="font-bold text-[var(--text-primary)]">3. </span>{t('security.setupStep3')}</p>
                    <CodeInput value={code} onChange={setCode} label={t('auth.code')} />
                </li>
            </ol>
            {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
            <button onClick={handleEnable} disabled={busy || !setup || code.length !== 6} className={primaryButtonClass}>
                {busy && <Loader2 size={18} className="animate-spin" />}
                {t('security.confirm')}
            </button>
        </Modal>
    );
};

const TwoFactorDisableModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { refreshAccount } = useAuth();
    const { t } = useLanguage();
    const { addToast } = useNotification();
    const errorMessage = useAuthErrorMessage();
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const handleDisable = async () => {
        setBusy(true);
        setError(null);
        try {
            await apiService.auth.mfaDisable(password, code);
            await refreshAccount().catch(() => undefined);
            addToast(t('security.disabled'), 'info');
            onClose();
        } catch (e) {
            setError(errorMessage(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Modal title={t('security.disableTitle')} onClose={onClose}>
            <p className="text-sm text-[var(--text-secondary)]">{t('security.disableBody')}</p>
            <input type="password" autoComplete="current-password" aria-label={t('auth.password')} placeholder={t('auth.password')} value={password} onChange={e => setPassword(e.target.value)} className={`${inputClass} bg-[var(--bg-primary)]`} />
            <CodeInput value={code} onChange={setCode} allowRecovery label={t('security.codeOrRecovery')} />
            {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
            <button onClick={handleDisable} disabled={busy || !password || code.length < 6} className={dangerButtonClass}>
                {busy && <Loader2 size={18} className="animate-spin" />}
                {t('security.turnOff')}
            </button>
        </Modal>
    );
};

const DeleteAccountModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { account, deleteAccount } = useAuth();
    const { t } = useLanguage();
    const errorMessage = useAuthErrorMessage();
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const needsCode = !!account?.mfaEnabled;

    const handleDelete = async () => {
        setBusy(true);
        setError(null);
        try {
            await deleteAccount(password, needsCode ? code : undefined);
            // deleteAccount reloads the app on success.
        } catch (e) {
            setError(errorMessage(e) || t('security.deleteFailed'));
            setBusy(false);
        }
    };

    return (
        <Modal title={t('security.deleteTitle')} onClose={onClose} locked={busy}>
            <p className="text-sm text-[var(--text-secondary)]">{t('security.deleteBody')}</p>
            <input type="password" autoComplete="current-password" aria-label={t('auth.password')} placeholder={t('auth.password')} value={password} onChange={e => setPassword(e.target.value)} className={`${inputClass} bg-[var(--bg-primary)]`} />
            {needsCode && <CodeInput value={code} onChange={setCode} allowRecovery label={t('security.codeOrRecovery')} />}
            <div>
                <label htmlFor="delete-confirm" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 ml-1">{t('security.typeDelete')}</label>
                <input id="delete-confirm" value={confirmText} onChange={e => setConfirmText(e.target.value)} autoCapitalize="characters" className={`${inputClass} bg-[var(--bg-primary)]`} placeholder="DELETE" />
            </div>
            {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
            <button onClick={handleDelete} disabled={busy || !password || (needsCode && code.length < 6) || confirmText.trim().toUpperCase() !== 'DELETE'} className={dangerButtonClass}>
                {busy && <Loader2 size={18} className="animate-spin" />}
                {t('security.deleteConfirm')}
            </button>
        </Modal>
    );
};

/** Profile card: signed-in account, two-factor status, sign-out and account deletion. */
const SecuritySettings: React.FC = () => {
    const { account } = useAuth();
    const { t } = useLanguage();
    const [modal, setModal] = useState<'enable' | 'disable' | 'delete' | null>(null);
    const online = typeof navigator === 'undefined' || navigator.onLine;

    return (
        <div className="bg-[var(--bg-secondary)] p-6 rounded-3xl border border-[var(--border-primary-translucent)] shadow-sm space-y-5">
            <div className="min-w-0">
                <h3 className="font-bold text-[var(--text-primary)] text-lg">{t('security.title')}</h3>
                {account && <p className="text-sm text-[var(--text-secondary)] truncate">{t('security.signedInAs', { email: account.email })}</p>}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-primary)]">
                <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2.5 rounded-full shrink-0 ${account?.mfaEnabled ? 'bg-green-500/15 text-green-500' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}>
                        {account?.mfaEnabled ? <ShieldCheck size={20} /> : <ShieldOff size={20} />}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-[var(--text-primary)]">{t('security.twoFactor')}</p>
                        <p className="text-sm text-[var(--text-secondary)]">
                            {!account || !online ? t('security.offline') : account.mfaEnabled ? t('security.twoFactorOn') : t('security.twoFactorOff')}
                        </p>
                    </div>
                </div>
                {account && online && (
                    <button
                        onClick={() => setModal(account.mfaEnabled ? 'disable' : 'enable')}
                        className={`shrink-0 self-stretch sm:self-auto px-4 py-2.5 rounded-xl text-sm font-bold ${account.mfaEnabled ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]' : 'bg-[var(--accent-primary)] text-white'}`}
                    >
                        {account.mfaEnabled ? t('security.turnOff') : t('security.turnOn')}
                    </button>
                )}
            </div>

            {account && online && (
                <div className="flex items-center justify-between gap-4 pt-1">
                    <div className="min-w-0">
                        <p className="font-bold text-red-500">{t('security.deleteAccount')}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{t('security.deleteAccountDesc')}</p>
                    </div>
                    <button onClick={() => setModal('delete')} aria-label={t('security.deleteAccount')} className="shrink-0 p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20">
                        <Trash2 size={18} />
                    </button>
                </div>
            )}

            <AnimatePresence>
                {modal === 'enable' && <TwoFactorSetupModal onClose={() => setModal(null)} />}
                {modal === 'disable' && <TwoFactorDisableModal onClose={() => setModal(null)} />}
                {modal === 'delete' && <DeleteAccountModal onClose={() => setModal(null)} />}
            </AnimatePresence>
        </div>
    );
};

export default SecuritySettings;
