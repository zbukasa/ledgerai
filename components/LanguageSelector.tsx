
import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from './Logo';

const LanguageSelector: React.FC = () => {
    const { setLanguage, confirmLanguageSelection } = useLanguage();

    const handleSelect = (lang: 'en' | 'fr' | 'ln' | 'sw' | 'es' | 'pt' | 'hi' | 'ar') => {
        setLanguage(lang);
        confirmLanguageSelection();
    };

    const buttonClasses = "w-full p-4 rounded-lg text-lg font-bold transition-colors bg-[var(--bg-secondary)] text-[var(--text-white)] hover:bg-[var(--accent-primary)] hover:text-[var(--text-contrast)]";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-[var(--bg-primary)] flex flex-col items-center justify-center z-[100] p-4 text-center"
        >
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                 <Logo size={48} color="var(--text-white)" withText className="mb-8" />
            </motion.div>
            
            <p className="text-[var(--text-secondary)] mt-4 mb-8">
                Welcome / Bienvenue / Bienvenido / Bem-vindo / नमस्ते / أهلاً بك
                <br />
                Please select your language / Veuillez sélectionner votre langue
            </p>

            <div className="w-full max-w-sm grid grid-cols-2 gap-4">
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    onClick={() => handleSelect('en')}
                    className={buttonClasses}
                >
                    English
                </motion.button>
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={() => handleSelect('fr')}
                    className={buttonClasses}
                >
                    Français
                </motion.button>
                 <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    onClick={() => handleSelect('ln')}
                    className={buttonClasses}
                >
                    Lingala
                </motion.button>
                 <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                    onClick={() => handleSelect('sw')}
                    className={buttonClasses}
                >
                    Swahili
                </motion.button>
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    onClick={() => handleSelect('es')}
                    className={buttonClasses}
                >
                    Español
                </motion.button>
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                    onClick={() => handleSelect('pt')}
                    className={buttonClasses}
                >
                    Português
                </motion.button>
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.0 }}
                    onClick={() => handleSelect('hi')}
                    className={buttonClasses}
                >
                    हिन्दी
                </motion.button>
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.1 }}
                    onClick={() => handleSelect('ar')}
                    className={buttonClasses}
                >
                    العربية
                </motion.button>
            </div>
        </motion.div>
    );
};

export default LanguageSelector;
