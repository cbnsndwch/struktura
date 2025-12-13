/**
 * Authentication context provider for React Router 7
 *
 * Updated to use Better Auth for session-based authentication.
 * Manages authentication state, user data across the application.
 */
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { useSession, signOut, type AuthUser } from './auth-client.js';

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

/**
 * AuthProvider component that wraps the application with authentication context.
 *
 * Uses Better Auth's useSession hook for automatic session management:
 * - Sessions are stored in httpOnly cookies (more secure than localStorage)
 * - Automatic session refresh when near expiration
 * - Real-time session state updates
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const navigate = useNavigate();

    // Better Auth's useSession hook handles all session state management
    const {
        data: session,
        isPending: isLoading,
        error: sessionError,
        refetch: checkAuth
    } = useSession();

    const isAuthenticated = !!session?.user;
    const user = session?.user ?? null;
    const error = sessionError?.message ?? null;

    const logout = async () => {
        try {
            // Better Auth signOut clears the session cookie
            await signOut();
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            navigate('/auth/login');
        }
    };

    // Handle session expiration
    useEffect(() => {
        if (!isLoading && !isAuthenticated && !sessionError) {
            // Session expired or not present - could redirect to login
            // Uncomment if you want automatic redirect on session loss:
            // navigate('/auth/login');
        }
    }, [isLoading, isAuthenticated, sessionError, navigate]);

    const value: AuthContextValue = {
        isAuthenticated,
        isLoading,
        user,
        error,
        checkAuth: async () => {
            await checkAuth();
        },
        logout
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

/**
 * Hook to access authentication context
 * Must be used within an AuthProvider
 *
 * @example
 * ```tsx
 * function Profile() {
 *   const { user, isLoading, logout } = useAuth();
 *
 *   if (isLoading) return <Spinner />;
 *   if (!user) return <Navigate to="/auth/login" />;
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {user.name}</h1>
 *       <button onClick={logout}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

/**
 * Re-export auth client utilities for convenience
 */
export { signIn, signUp, signOut, useSession } from './auth-client.js';
export type { AuthUser } from './auth-client.js';
