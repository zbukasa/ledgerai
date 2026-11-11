import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ServiceError } from '../services/apiService';
import Logo from './Logo';

type Mode = 'signIn' | 'mfa' | 'signUp';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const inputClass = "w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] p-4 rounded-xl border border-transparent focus:border-[var(--accent-primary)] outline-none transition-all placeholder:text-[var(--text-tertiary)]";
const labelClass = "block text-sm font-semibold text-[var(--text-secondary)] mb-2 ml-1";
const primaryButtonClass = "w-full flex items-center justify-center gap-2 py-4 bg-[var(--accent-primary)] text-white font-bold rounded-xl hover:brightness-110 shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed";
const linkClass = "text-[var(--accent-primary)] font-bold hover:underline";

/** Maps API failures to a translated message. */
export const useAuthErrorMessage = () => {
    const { t } = useLanguage();
    return (error: unknown, context: 'signIn' | 'mfa' | 'signUp' | 'other' = 'other'): string => {
        if (!(error instanceof ServiceError)) return t('auth.genericError');
        if (error.status === 0 || error.status >= 500) return t('auth.networkError');
        if (error.status === 429) return t('auth.tooManyAttempts');
        if (error.detail?.code === 'mfa_token_expired') return t('auth.mfaExpired');
        if (context === 'signIn' && error.status === 401) return t('auth.invalidCredentials');
        if (context === 'mfa' && error.status === 401) return t('auth.invalidCode');
        if (context === 'signUp' && error.status === 409) return t('auth.emailTaken');
        return error.message || t('auth.genericError');
    };
};

const AuthScreen: React.FC = () => {
    const { users, signIn, verifyMfa, signUp } = useAuth();
    const { t } = useLanguage();
    const errorMessage = useAuthErrorMessage();

    // Profiles created on this device before accounts existed. Signing up can adopt one so
    // its ledger stays attached. Built-in demo profiles have non-UUID ids and are skipped.
    const unlinkedProfiles = useMemo(
        () => users.filter(u => !u.accountLinked && UUID_RE.test(u.id)),
        [users]
    );

    const [mode, setMode] = useState<Mode>(unlinkedProfiles.length > 0 ? 'signUp' : 'signIn');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState(unlinkedProfiles[0]?.name || '');
    const [linkProfileId, setLinkProfileId] = useState<string>(unlinkedProfiles[0]?.id || '');
    const [mfaToken, setMfaToken] = useState('');
    const [code, setCode] = useState('');
    const [useRecovery, setUseRecovery] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const switchMode = (next: Mode) => {
        setMode(next);
        setError(null);
        setCode('');
        setUseRecovery(false);
    };

    const run = async (fn: () => Promise<void>, context: 'signIn' | 'mfa' | 'signUp') => {
        setBusy(true);
        setError(null);
        try {
            await fn();
        } catch (e) {
            setError(errorMessage(e, context));
            if (context === 'mfa' && e instanceof ServiceError && e.detail?.code === 'mfa_token_expired') {
                switchMode('signIn');
                setError(t('auth.mfaExpired'));
            }
        } finally {
            setBusy(false);
        }
    };

    const handleSignIn = (e: React.FormEvent) => {
        e.preventDefault();
        run(async () => {
            const result = await signIn(email, password);
            if (result.mfaRequired) {
                setMfaToken(result.mfaToken);
                setPassword('');
                switchMode('mfa');
            }
        }, 'signIn');
    };

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        run(() => verifyMfa(mfaToken, code), 'mfa');
    };

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) return setError(t('auth.passwordTooShort'));
        if (password !== confirmPassword) return setError(t('auth.passwordMismatch'));
        run(async () => {
            await signUp(name, email, password, linkProfileId || undefined);
        }, 'signUp');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--bg-primary)] overflow-y-auto z-50"
        >
            <div className="min-h-full flex flex-col items-center justify-center px-4 py-10">
                <Logo size={48} color="var(--text-white)" withText className="mb-8" />

                <div className="w-full max-w-sm space-y-6">
                    {mode === 'signIn' && (
                        <form onSubmit={handleSignIn} className="space-y-4">
                            <div className="text-center space-y-1">
                                <h1 className="text-2xl font-bold text-[var(--text-white)]">{t('auth.signInTitle')}</h1>
                                <p className="text-[var(--text-secondary)]">{t('auth.signInSubtitle')}</p>
                            </div>
                            <div>
                                <label htmlFor="auth-email" className={labelClass}>{t('auth.email')}</label>
                                <input id="auth-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="name@example.com" />
                            </div>
                            <div>
                                <label htmlFor="auth-password" className={labelClass}>{t('auth.password')}</label>
                                <input id="auth-password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
                            </div>
                            {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
                            <button type="submit" disabled={busy || !email || !password} className={primaryButtonClass}>
                                {busy && <Loader2 size={18} className="animate-spin" />}
                                {t('auth.signIn')}
                            </button>
                            <p className="text-center text-sm text-[var(--text-secondary)]">
                                {t('auth.noAccount')} <button type="button" onClick={() => switchMode('signUp')} className={linkClass}>{t('auth.createAccount')}</button>
                            </p>
                        </form>
                    )}

                    {mode === 'mfa' && (
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="text-center space-y-2">
                                <div className="inline-flex p-3 rounded-full bg-[var(--bg-secondary)] text-[var(--accent-primary-light)]">
                                    <ShieldCheck size={28} />
                                </div>
                                <h1 className="text-2xl font-bold text-[var(--text-white)]">{t('auth.mfaTitle')}</h1>
                                <p className="text-[var(--text-secondary)]">{useRecovery ? t('auth.recoverySubtitle') : t('auth.mfaSubtitle')}</p>
                            </div>
                            <input
                                aria-label={t('auth.code')}
                                autoFocus
                                required
                                value={code}
                                onChange={e => setCode(useRecovery ? e.target.value.toUpperCase() : e.target.value.replace(/\D/g, '').slice(0, 6))}
                                inputMode={useRecovery ? 'text' : 'numeric'}
                                autoComplete="one-time-code"
                                placeholder={useRecovery ? 'XXXX-XXXX-XXXX' : '123456'}
                                className={`${inputClass} text-center text-2xl tracking-[0.3em] font-mono`}
                            />
                            {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
                            <button type="submit" disabled={busy || (useRecovery ? code.length < 12 : code.length !== 6)} className={primaryButtonClass}>
                                {busy && <Loader2 size={18} className="animate-spin" />}
                                {t('auth.verify')}
                            </button>
                            <div className="flex justify-between text-sm">
                                <button type="button" onClick={() => switchMode('signIn')} className="text-[var(--text-secondary)] hover:underline">{t('auth.back')}</button>
                                <button type="button" onClick={() => { setUseRecovery(!useRecovery); setCode(''); setError(null); }} className={linkClass}>
                                    {useRecovery ? t('auth.useAuthenticator') : t('auth.useRecovery')}
                                </button>
                            </div>
                        </form>
                    )}

                    {mode === 'signUp' && (
                        <form onSubmit={handleSignUp} className="space-y-4">
                            <div className="text-center space-y-1">
                                <h1 className="text-2xl font-bold text-[var(--text-white)]">{t('auth.createTitle')}</h1>
                                <p className="text-[var(--text-secondary)]">{t('auth.createSubtitle')}</p>
                            </div>
                            {unlinkedProfiles.length > 0 && (
                                <div>
                                    <label htmlFor="auth-profile" className={labelClass}>{t('auth.keepDataFor')}</label>
                                    <select
                                        id="auth-profile"
                                        value={linkProfileId}
                                        onChange={e => {
                                            setLinkProfileId(e.target.value);
                                            const profile = unlinkedProfiles.find(u => u.id === e.target.value);
                                            if (profile) setName(profile.name);
                                        }}
                                        className={inputClass}
                                    >
                                        {unlinkedProfiles.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        <option value="">{t('auth.startFresh')}</option>
                                    </select>
                                </div>
                            )}
                            <div>
                                <label htmlFor="auth-name" className={labelClass}>{t('auth.name')}</label>
                                <input id="auth-name" autoComplete="name" required value={name} onChange={e => setName(e.target.value)} className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="auth-new-email" className={labelClass}>{t('auth.email')}</label>
                                <input id="auth-new-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="name@example.com" />
                            </div>
                            <div>
                                <label htmlFor="auth-new-password" className={labelClass}>{t('auth.password')}</label>
                                <input id="auth-new-password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className={inputClass} placeholder={t('auth.passwordHint')} />
                            </div>
                            <div>
                                <label htmlFor="auth-confirm-password" className={labelClass}>{t('auth.confirmPassword')}</label>
                                <input id="auth-confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} />
                            </div>
                            <p className="text-xs text-[var(--text-tertiary)]">{t('auth.agreeNotice')}</p>
                            {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
                            <button type="submit" disabled={busy || !name.trim() || !email || !password || !confirmPassword} className={primaryButtonClass}>
                                {busy && <Loader2 size={18} className="animate-spin" />}
                                {t('auth.createAccount')}
                            </button>
                            <p className="text-center text-sm text-[var(--text-secondary)]">
                                {t('auth.haveAccount')} <button type="button" onClick={() => switchMode('signIn')} className={linkClass}>{t('auth.signIn')}</button>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default AuthScreen;
