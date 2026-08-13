
import React, { createContext, useState, useEffect, ReactNode, useCallback, useContext } from 'react';
import enData from '../locales/en.json';
import frData from '../locales/fr.json';
import lnData from '../locales/ln.json';
import swData from '../locales/sw.json';
import esData from '../locales/es.json';
import ptData from '../locales/pt.json';
import hiData from '../locales/hi.json';
import arData from '../locales/ar.json';

type Language = 'en' | 'fr' | 'ln' | 'sw' | 'es' | 'pt' | 'hi' | 'ar';
type Translations = { [key: string]: any };

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string, options?: { [key: string]: string | number }) => string;
    isLanguageSelected: boolean;
    confirmLanguageSelection: () => void;
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getNestedTranslation = (translations: { [lang: string]: Translations }, language: Language, key: string): string | undefined => {
    const langTranslations = translations[language];
    if (!langTranslations) return undefined;
    return key.split('.').reduce<any>((obj, k) => {
        return obj && obj[k];
    }, langTranslations);
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const storedLang = localStorage.getItem('appLanguage');
        if (storedLang && ['en', 'fr', 'ln', 'sw', 'es', 'pt', 'hi', 'ar'].includes(storedLang)) {
            return storedLang as Language;
        }
        return 'en';
    });

    const [translations, setTranslations] = useState<{ en: Translations, fr: Translations, ln: Translations, sw: Translations, es: Translations, pt: Translations, hi: Translations, ar: Translations } | null>(null);
    const [isLanguageSelected, setIsLanguageSelected] = useState<boolean>(() => {
        return localStorage.getItem('appLanguageSelected') === 'true';
    });

    useEffect(() => {
        // Use imported data directly instead of fetching
        setTranslations({ en: enData, fr: frData, ln: lnData, sw: swData, es: esData, pt: ptData, hi: hiData, ar: arData });
    }, []);


    useEffect(() => {
        localStorage.setItem('appLanguage', language);
    }, [language]);
    
    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const confirmLanguageSelection = () => {
        localStorage.setItem('appLanguageSelected', 'true');
        setIsLanguageSelected(true);
    };

    const isRTL = language === 'ar';

    const t = useCallback((key: string, options?: { [key: string]: string | number }): string => {
        if (!translations) return key; // Return key if translations aren't loaded

        let translation = getNestedTranslation(translations, language, key);

        if (!translation) {
            // console.warn(`Translation key '${key}' not found in '${language}'. Falling back to English.`);
            translation = getNestedTranslation(translations, 'en', key) || key; // Fallback to English
        }

        if (options && translation !== key) {
            Object.keys(options).forEach(k => {
                translation = (translation as string).replace(`{${k}}`, String(options[k]));
            });
        }

        return translation as string;
    }, [language, translations]);

    const value = { language, setLanguage, t, isLanguageSelected, confirmLanguageSelection, isRTL };
    
    // Don't render children until translations are loaded to prevent a flash of untranslated content.
    if (!translations) {
        return (
            <div style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Inter', sans-serif"
            }}>
                Loading...
            </div>
        );
    }

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
