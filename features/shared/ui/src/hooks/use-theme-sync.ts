import * as React from 'react';
import { useTheme } from './use-theme.js';

type Theme = 'light' | 'dark' | 'system';

interface UseThemeSyncOptions {
    isAuthenticated?: boolean;
    userId?: string;
    onSyncTheme?: (theme: Theme) => Promise<void>;
}

/**
 * Hook that extends useTheme with database synchronization for authenticated users.
 * Falls back to localStorage-only behavior for unauthenticated users.
 */
export function useThemeSync(options: UseThemeSyncOptions = {}) {
    const { theme, setTheme: setThemeLocal, resolvedTheme } = useTheme();
    const { isAuthenticated = false, userId, onSyncTheme } = options;
    
    const [isSyncing, setIsSyncing] = React.useState(false);

    // Enhanced setTheme that syncs with database when authenticated
    const setTheme = React.useCallback(async (newTheme: Theme) => {
        // Always update local state first for immediate UI response
        setThemeLocal(newTheme);
        
        // Sync with database if user is authenticated
        if (isAuthenticated && userId && onSyncTheme) {
            setIsSyncing(true);
            try {
                await onSyncTheme(newTheme);
            } catch (error) {
                console.error('Failed to sync theme with server:', error);
                // Note: We don't revert the local theme change
                // The localStorage will still work as a backup
            } finally {
                setIsSyncing(false);
            }
        }
    }, [setThemeLocal, isAuthenticated, userId, onSyncTheme]);

    return {
        theme,
        setTheme,
        resolvedTheme,
        isSyncing
    };
}

/**
 * Example sync function that can be passed to useThemeSync
 * This would typically be implemented in the main app with actual API calls
 */
export function createThemeSyncFunction(apiEndpoint: string = '/api/auth/preferences') {
    return async (theme: Theme): Promise<void> => {
        const response = await fetch(apiEndpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies for authentication
            body: JSON.stringify({ theme })
        });

        if (!response.ok) {
            throw new Error(`Failed to sync theme: ${response.status} ${response.statusText}`);
        }
    };
}