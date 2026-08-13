
import { useContext } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * @deprecated The `useLanguage` hook is now the preferred way to access context. 
 * This hook is kept for compatibility but may be removed in the future.
 */
export const useTranslation = () => {
    return useLanguage();
};
