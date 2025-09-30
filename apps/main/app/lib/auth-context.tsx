/**
 * Authentication context provider for React Router 7
 * Manages authentication state, user data, and token refresh across the application
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { isAuthenticated } from './auth.js';

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    roles: string[];
    emailVerified: boolean;
}

export interface AuthContextValue {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: AuthUser | null;
    error: string | null;
    checkAuth: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const checkAuth = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const authenticated = isAuthenticated();
            setIsAuthenticatedState(authenticated);

            if (authenticated) {
                // Fetch user data from API
                const accessToken = localStorage.getItem('access_token');
                const headers: HeadersInit = accessToken
                    ? { 'Authorization': `Bearer ${accessToken}` }
                    : {};
                const response = await fetch('/api/auth/me', {
                    credentials: 'include',
                    headers
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser({
                        id: userData.id,
                        email: userData.email,
                        name: userData.name,
                        roles: userData.roles || [],
                        emailVerified: userData.emailVerified || false
                    });
                } else if (response.status === 401) {
                    // Token expired or invalid
                    setIsAuthenticatedState(false);
                    setUser(null);
                    // Clear invalid tokens
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                }
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            setError(err instanceof Error ? err.message : 'Authentication check failed');
            setIsAuthenticatedState(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            // Call logout API
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (err) {
            console.error('Logout API call failed:', err);
        } finally {
            // Clear local state regardless of API call result
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setIsAuthenticatedState(false);
            setUser(null);
            navigate('/auth/login');
        }
    };

    useEffect(() => {
        // Only check auth on client-side
        if (typeof window !== 'undefined') {
            checkAuth();
        }
    }, []);

    const value: AuthContextValue = {
        isAuthenticated: isAuthenticatedState,
        isLoading,
        user,
        error,
        checkAuth,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication context
 * Must be used within an AuthProvider
 */
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
