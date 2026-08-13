import React, { createContext, useState, useContext, ReactNode, useLayoutEffect } from 'react';

export type Theme = 'dark' | 'light' | 'true-black' | 'cyborg' | 'terminal' | 'sunset' | 'earthy';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-light', 'theme-true-black', 'theme-cyborg', 'theme-terminal', 'theme-sunset', 'theme-paper', 'theme-earthy');
    root.classList.add(`theme-${theme}`);
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = localStorage.getItem('appTheme') as Theme;
        if (saved === 'paper' as any) return 'dark';
        return saved || 'dark';
    });

    useLayoutEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        localStorage.setItem('appTheme', newTheme);
        setThemeState(newTheme);
    };
    
    const value = { theme, setTheme };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
