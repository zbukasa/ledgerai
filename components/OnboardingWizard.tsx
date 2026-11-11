
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, User, Globe, DollarSign, Camera, Upload, Check, HardHat, Building2, Users, Key } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency, currencyDetails } from '../contexts/CurrencyContext';
import { v4 as uuidv4 } from 'uuid';
import { dataService } from '../services/dataService';
import { blobToBase64 } from '../utils/helpers';
import CameraCapture from './CameraCapture';
import Logo from './Logo';
import LegalScreen from './LegalScreen';
import { useAuthErrorMessage } from './AuthScreen';

interface OnboardingWizardProps {
    onComplete: () => void;
}

const steps = [
    { id: 'language', title: 'Language', icon: Globe },
    { id: 'profile', title: 'Identity', icon: User },
    { id: 'org_choice', title: 'Organization', icon: Building2 },
    { id: 'balance', title: 'Starting Point', icon: DollarSign },
];

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const { setLanguage, confirmLanguageSelection, t } = useLanguage();
    const { currentUser, signUp, updateBusiness, joinBusiness, createBusiness } = useAuth();
    const authErrorMessage = useAuthErrorMessage();
    const { preferredCurrency, setPreferredCurrency, allCurrencies } = useCurrency();

    // Step 1 Data
    const [selectedLang, setSelectedLang] = useState<'en' | 'fr' | 'ln' | 'sw' | 'es' | 'pt' | 'hi' | 'ar'>('en');

    // Step 2 Data
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileError, setProfileError] = useState<string | null>(null);
    const [creatingAccount, setCreatingAccount] = useState(false);
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState<'Admin' | 'Manager'>('Admin');
    const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
    const [showLegal, setShowLegal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Step 3 Data (Org Choice)
    const [orgMode, setOrgMode] = useState<'create' | 'join' | null>(null);
    const [inviteCode, setInviteCode] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [businessType, setBusinessType] = useState('');
    const [businessDescription, setBusinessDescription] = useState('');

    // Step 4 Data
    const [initialBalance, setInitialBalance] = useState('');

    const handleLanguageConfirm = () => {
        setLanguage(selectedLang);
        confirmLanguageSelection();
        setCurrentStep(1);
    };

    // Creates the account here (not at the end) so problems like an email that's already
    // registered show up on the step where they can be fixed.
    const handleProfileConfirm = async () => {
        if (!name.trim() || !email.trim()) return;
        if (!hasAcceptedTerms) {
            alert("Please accept the Terms of Service and Privacy Policy to continue.");
            return;
        }
        if (password.length < 8) return setProfileError(t('auth.passwordTooShort'));
        if (password !== confirmPassword) return setProfileError(t('auth.passwordMismatch'));

        setCreatingAccount(true);
        setProfileError(null);
        try {
            await signUp(name, email, password, undefined, {
                role,
                phone: phone || undefined,
                avatarUrl: avatarBase64 ? `data:image/jpeg;base64,${avatarBase64}` : undefined,
                hasAcceptedTerms: true,
            });
            setPassword('');
            setConfirmPassword('');
            setCurrentStep(2);
        } catch (e) {
            setProfileError(authErrorMessage(e, 'signUp'));
        } finally {
            setCreatingAccount(false);
        }
    };

    const handleOrgConfirm = async () => {
        if (orgMode === 'join') {
            const success = await joinBusiness(inviteCode);
            if (success) setCurrentStep(3);
        } else if (orgMode === 'create') {
            if (!businessName.trim()) return;
            setCurrentStep(3);
        }
    };

    const handleCapture = async (blob: Blob) => {
        try {
            const base64 = await blobToBase64(blob);
            setAvatarBase64(base64);
            setIsCameraOpen(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await blobToBase64(file);
            setAvatarBase64(base64);
        }
    };

    const handleComplete = async () => {
        // The account and profile were created at the profile step.
        if (!currentUser) return;
        const userId = currentUser.id;

        // Handle Business/Organization creation if in create mode
        if (orgMode === 'create') {
            createBusiness(businessName, businessType, businessDescription);
        }

        if (initialBalance && parseFloat(initialBalance) > 0) {
            await dataService.createTransaction({
                id: uuidv4(),
                date: new Date(),
                type: 'income',
                amount: parseFloat(initialBalance),
                currency: preferredCurrency,
                item: 'Initial Balance',
                categoryId: 'cat-income', 
                userId: userId
            });
        }
        
        onComplete();
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center font-sans text-[var(--text-primary)] selection:bg-[var(--accent-primary)] selection:text-white overflow-x-hidden">
            
            {/* Camera Modal */}
            <AnimatePresence>
                {isCameraOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black"
                    >
                        <CameraCapture onCapture={handleCapture} onCancel={() => setIsCameraOpen(false)} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Navigation / Progress */}
            <div className="w-full max-w-2xl px-6 py-8 flex justify-between items-center">
                <Logo size={32} withText />
                <div className="flex space-x-2">
                    {steps.map((step, idx) => {
                        const isActive = idx === currentStep;
                        const isCompleted = idx < currentStep;
                        return (
                            <div 
                                key={step.id} 
                                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${isActive ? 'w-8 bg-[var(--accent-primary)]' : isCompleted ? 'w-8 bg-[var(--text-secondary)]' : 'w-2 bg-[var(--bg-tertiary)]'}`} 
                            />
                        );
                    })}
                </div>
            </div>

            {/* Main Content Container */}
            <div className="flex-grow w-full flex flex-col items-center justify-center p-6 pb-20">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-lg"
                >
                    {/* STEP 1: LANGUAGE */}
                    {currentStep === 0 && (
                        <div className="text-center space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tight">Select Language</h2>
                                <p className="text-[var(--text-secondary)] text-lg">Choose your preferred interface language.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <LanguageCard lang="en" label="English" sub="English" selected={selectedLang === 'en'} onClick={() => setSelectedLang('en')} />
                                <LanguageCard lang="fr" label="Français" sub="French" selected={selectedLang === 'fr'} onClick={() => setSelectedLang('fr')} />
                                <LanguageCard lang="ln" label="Lingala" sub="Lingala" selected={selectedLang === 'ln'} onClick={() => setSelectedLang('ln')} />
                                <LanguageCard lang="sw" label="Swahili" sub="Kiswahili" selected={selectedLang === 'sw'} onClick={() => setSelectedLang('sw')} />
                                <LanguageCard lang="es" label="Español" sub="Spanish" selected={selectedLang === 'es'} onClick={() => setSelectedLang('es')} />
                                <LanguageCard lang="pt" label="Português" sub="Portuguese" selected={selectedLang === 'pt'} onClick={() => setSelectedLang('pt')} />
                                <LanguageCard lang="hi" label="हिन्दी" sub="Hindi" selected={selectedLang === 'hi'} onClick={() => setSelectedLang('hi')} />
                                <LanguageCard lang="ar" label="العربية" sub="Arabic" selected={selectedLang === 'ar'} onClick={() => setSelectedLang('ar')} />
                            </div>

                            <div className="pt-4">
                                <PrimaryButton onClick={handleLanguageConfirm} label="Continue" />
                            </div>
                        </div>
                    )}

                    {/* STEP 2: PROFILE */}
                    {currentStep === 1 && (
                        <div className="text-center space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tight">Create Profile</h2>
                                <p className="text-[var(--text-secondary)] text-lg">Let's set up your identity.</p>
                            </div>

                            <div className="flex justify-center py-4">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full bg-[var(--bg-secondary)] border-[3px] border-[var(--border-primary)] flex items-center justify-center overflow-hidden shadow-2xl">
                                        {avatarBase64 ? (
                                            <img src={`data:image/jpeg;base64,${avatarBase64}`} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={48} className="text-[var(--text-tertiary)]" />
                                        )}
                                    </div>
                                    
                                    {/* Avatar Actions */}
                                    <div className="absolute -bottom-2 -right-2 flex gap-2">
                                        <button 
                                            onClick={() => setIsCameraOpen(true)}
                                            className="p-2.5 bg-[var(--accent-primary)] text-white rounded-full shadow-lg hover:brightness-110 transition-all transform hover:scale-105"
                                            title="Take Photo"
                                        >
                                            <Camera size={18} />
                                        </button>
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-2.5 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-full shadow-lg hover:bg-[var(--bg-interactive-hover)] transition-all transform hover:scale-105"
                                            title="Upload Photo"
                                        >
                                            <Upload size={18} />
                                        </button>
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                                </div>
                            </div>

                            <div className="space-y-4 text-left">
                                <div className="group">
                                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 ml-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] p-4 rounded-xl border border-transparent focus:border-[var(--accent-primary)] outline-none transition-all placeholder:text-[var(--text-tertiary)]"
                                        placeholder="e.g. Jean Mutombo"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 ml-1">{t('auth.email')}</label>
                                        <input 
                                            type="email" 
                                            autoComplete="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] p-4 rounded-xl border border-transparent focus:border-[var(--accent-primary)] outline-none transition-all placeholder:text-[var(--text-tertiary)]"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 ml-1">Phone (Optional)</label>
                                        <input 
                                            type="tel" 
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] p-4 rounded-xl border border-transparent focus:border-[var(--accent-primary)] outline-none transition-all placeholder:text-[var(--text-tertiary)]"
                                            placeholder="+243 ..."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="group">
                                        <label htmlFor="onboarding-password" className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 ml-1">{t('auth.password')}</label>
                                        <input
                                            id="onboarding-password"
                                            type="password"
                                            autoComplete="new-password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] p-4 rounded-xl border border-transparent focus:border-[var(--accent-primary)] outline-none transition-all placeholder:text-[var(--text-tertiary)]"
                                            placeholder={t('auth.passwordHint')}
                                        />
                                    </div>
                                    <div className="group">
                                        <label htmlFor="onboarding-confirm-password" className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 ml-1">{t('auth.confirmPassword')}</label>
                                        <input
                                            id="onboarding-confirm-password"
                                            type="password"
                                            autoComplete="new-password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] p-4 rounded-xl border border-transparent focus:border-[var(--accent-primary)] outline-none transition-all placeholder:text-[var(--text-tertiary)]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 ml-1">{t('profile.role') || 'Role'}</label>
                                    <div className="flex p-1 bg-[var(--bg-secondary)] rounded-xl">
                                        {[
                                            { id: 'Admin', label: t('profile.administrator') },
                                            { id: 'Manager', label: t('profile.manager') }
                                        ].map((r) => (
                                            <button 
                                                key={r.id}
                                                onClick={() => setRole(r.id as any)} 
                                                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${role === r.id ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm ring-1 ring-black/5' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
                                            >
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary-translucent)]">
                                    <input 
                                        type="checkbox" 
                                        id="terms" 
                                        checked={hasAcceptedTerms} 
                                        onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                                        className="mt-1 w-4 h-4 rounded border-[var(--border-primary)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] cursor-pointer"
                                    />
                                    <label htmlFor="terms" className="text-xs text-[var(--text-secondary)] leading-relaxed cursor-pointer">
                                        I agree to the <button onClick={() => setShowLegal(true)} className="text-[var(--accent-primary)] font-bold hover:underline">Terms of Service</button> and <button onClick={() => setShowLegal(true)} className="text-[var(--accent-primary)] font-bold hover:underline">Privacy Policy</button>. I understand my data is processed via Google Gemini and secured on Google Cloud.
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4">
                                <PrimaryButton 
                                    onClick={handleProfileConfirm} 
                                    disabled={!name || !email || !password || !confirmPassword || !hasAcceptedTerms || creatingAccount}
                                    label="Next Step"
                                />
                                {profileError && <p role="alert" className="mt-3 text-sm text-red-500">{profileError}</p>}
                                <p className="mt-4 text-sm text-[var(--text-secondary)]">
                                    {t('auth.haveAccount')}{' '}
                                    <button onClick={onComplete} className="text-[var(--accent-primary)] font-bold hover:underline">{t('auth.signIn')}</button>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: ORGANIZATION CHOICE */}
                    {currentStep === 2 && (
                        <div className="text-center space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tight">Organization Setup</h2>
                                <p className="text-[var(--text-secondary)] text-lg">
                                    Join an existing organization or create a new one for your household or business.
                                </p>
                            </div>

                            {!orgMode ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setOrgMode('join')}
                                        className="p-8 rounded-2xl border-2 border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-[var(--accent-primary)] transition-all flex flex-col items-center gap-4 group"
                                    >
                                        <div className="p-4 rounded-full bg-[var(--bg-tertiary)] text-[var(--accent-primary-light)] group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all">
                                            <Users size={32} />
                                        </div>
                                        <div className="text-xl font-bold">Join Existing</div>
                                        <div className="text-sm text-[var(--text-tertiary)]">Use an invite code from your team.</div>
                                    </button>
                                    <button 
                                        onClick={() => setOrgMode('create')}
                                        className="p-8 rounded-2xl border-2 border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-[var(--accent-primary)] transition-all flex flex-col items-center gap-4 group"
                                    >
                                        <div className="p-4 rounded-full bg-[var(--bg-tertiary)] text-[var(--accent-primary-light)] group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all">
                                            <Building2 size={32} />
                                        </div>
                                        <div className="text-xl font-bold">Create New</div>
                                        <div className="text-sm text-[var(--text-tertiary)]">Start a new group for your business.</div>
                                    </button>
                                </div>
                            ) : orgMode === 'join' ? (
                                <div className="space-y-6">
                                    <div className="text-left">
                                        <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 ml-1">Invite Code</label>
                                        <div className="relative">
                                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={20} />
                                            <input 
                                                type="text" 
                                                value={inviteCode}
                                                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                                maxLength={6}
                                                className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] p-4 pl-12 rounded-xl border border-transparent focus:border-[var(--accent-primary)] outline-none transition-all placeholder:text-[var(--text-tertiary)] font-mono text-xl tracking-widest"
                                                placeholder="ABC123"
                                            />
                                        </div>
                                        <p className="mt-2 text-xs text-[var(--text-tertiary)]">Ask your administrator for the 6-digit code.</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setOrgMode(null)} className="flex-1 py-4 font-bold text-[var(--text-secondary)]">Back</button>
                                        <PrimaryButton onClick={handleOrgConfirm} disabled={inviteCode.length < 6} label="Join Organization" />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="space-y-4 text-left">
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 ml-1">Company/Household Name</label>
                                            <input 
                                                type="text" 
                                                value={businessName}
                                                onChange={(e) => setBusinessName(e.target.value)}
                                                className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] p-4 rounded-xl border border-transparent focus:border-[var(--accent-primary)] outline-none transition-all placeholder:text-[var(--text-tertiary)]"
                                                placeholder="e.g. Mutombo Household"
                                            />
                                        </div>
                                        
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 ml-1">Type</label>
                                            <input 
                                                type="text" 
                                                value={businessType}
                                                onChange={(e) => setBusinessType(e.target.value)}
                                                className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] p-4 rounded-xl border border-transparent focus:border-[var(--accent-primary)] outline-none transition-all placeholder:text-[var(--text-tertiary)]"
                                                placeholder="e.g. Household, Retail, Logistics"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setOrgMode(null)} className="flex-1 py-4 font-bold text-[var(--text-secondary)]">Back</button>
                                        <PrimaryButton onClick={handleOrgConfirm} disabled={!businessName} label="Create & Continue" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 4: BALANCE */}
                    {currentStep === 3 && (
                        <div className="text-center space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tight">Starting Balance</h2>
                                <p className="text-[var(--text-secondary)] text-lg">Enter your current cash on hand.</p>
                            </div>

                            <div className="py-8">
                                {/* Fixed: Layout issue with overflowing width on mobile */}
                                <div className="flex items-center bg-[var(--bg-secondary)] p-2 rounded-2xl border border-[var(--border-primary-translucent)] shadow-sm w-full max-w-full overflow-hidden">
                                    <select 
                                        value={preferredCurrency}
                                        onChange={(e) => setPreferredCurrency(e.target.value as any)}
                                        className="bg-transparent text-[var(--text-primary)] font-bold p-4 outline-none text-xl cursor-pointer hover:text-[var(--accent-primary)] transition-colors flex-shrink-0"
                                    >
                                        {allCurrencies.map(c => (
                                            <option key={c} value={c}>
                                                {c} - {currencyDetails[c]?.country || c}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="h-8 w-[1px] bg-[var(--border-primary)] mx-2 flex-shrink-0"></div>
                                    <input 
                                        type="number" 
                                        value={initialBalance}
                                        onChange={(e) => setInitialBalance(e.target.value)}
                                        className="flex-1 bg-transparent text-[var(--text-primary)] p-4 text-2xl font-mono font-bold outline-none placeholder:text-[var(--text-tertiary)] min-w-0"
                                        placeholder="0.00"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <PrimaryButton onClick={handleComplete} label="Launch Dashboard" />
                            </div>
                        </div>
                    )}
                </motion.div>
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
        </div>
    );
};

const LanguageCard: React.FC<{ lang: string, label: string, sub: string, selected: boolean, onClick: () => void }> = ({ lang, label, sub, selected, onClick }) => (
    <button
        onClick={onClick}
        className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 group ${selected ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white shadow-xl scale-[1.02]' : 'border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:border-[var(--text-secondary)]'}`}
    >
        <div className="text-2xl font-bold mb-1">{label}</div>
        <div className={`text-sm ${selected ? 'text-white/80' : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]'}`}>{sub}</div>
        {selected && <div className="absolute top-4 right-4"><Check size={20} /></div>}
    </button>
);

const PrimaryButton: React.FC<{ onClick: () => void, disabled?: boolean, label: string }> = ({ onClick, disabled, label }) => (
    <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        disabled={disabled}
        className="w-full py-4 bg-[var(--accent-primary)] text-white rounded-xl font-bold text-lg shadow-lg shadow-[var(--accent-primary)]/30 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center space-x-2"
    >
        <span>{label}</span>
        <ArrowRight size={20} />
    </motion.button>
);

export default OnboardingWizard;
