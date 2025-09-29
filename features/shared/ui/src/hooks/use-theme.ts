import * as React from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'light' | 'dark';
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
    undefined
);

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

function isValidTheme(value: any): value is Theme {
    return value === 'light' || value === 'dark' || value === 'system';
}

function getStoredTheme(): Theme {
    if (typeof window === 'undefined') return 'system';
    try {
        const stored = localStorage.getItem('struktura-theme');
        return isValidTheme(stored) ? stored : 'system';
    } catch {
        return 'system';
    }
}

function storeTheme(theme: Theme): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('struktura-theme', theme);
    } catch {
        // Silently fail if localStorage is not available
    }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = React.useState<Theme>('system');
    const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>(
        'light'
    );

    const setTheme = React.useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        storeTheme(newTheme);
    }, []);

    // Initialize theme from localStorage on mount
    React.useEffect(() => {
        const storedTheme = getStoredTheme();
        setThemeState(storedTheme);
    }, []);

    // Update resolved theme when theme or system preference changes
    React.useEffect(() => {
        const updateResolvedTheme = () => {
            const resolved = theme === 'system' ? getSystemTheme() : theme;
            setResolvedTheme(resolved);

            // Apply theme class to document root
            if (typeof document !== 'undefined') {
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(resolved);
            }
        };

        updateResolvedTheme();

        // Listen for system theme changes
        if (theme === 'system' && typeof window !== 'undefined') {
            const mediaQuery = window.matchMedia(
                '(prefers-color-scheme: dark)'
            );
            const handleChange = () => updateResolvedTheme();

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    const value = React.useMemo(
        () => ({
            theme,
            setTheme,
            resolvedTheme
        }),
        [theme, setTheme, resolvedTheme]
    );

    return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme() {
    const context = React.useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
