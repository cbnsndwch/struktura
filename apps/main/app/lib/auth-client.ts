/**
 * Better Auth Client for React
 *
 * This module provides the Better Auth client configured for the Struktura frontend.
 * It replaces the previous JWT-based authentication with session-based auth.
 */
import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth client instance
 *
 * The client automatically handles:
 * - Session management with httpOnly cookies
 * - Automatic token refresh
 * - Sign in/up/out flows
 * - Session state via React hooks
 */
export const authClient = createAuthClient({
    // Base URL is automatically detected when running on same domain
    // For development, the frontend and backend are on the same origin (localhost:3007)
    baseURL:
        typeof window !== 'undefined' ? window.location.origin : undefined
});

// Export individual methods for convenience
export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession,
    resetPassword,
    requestPasswordReset,
    // Social auth methods
    signIn: { social: signInWithSocial }
} = authClient;

// Alias for consistency with other naming conventions
export const forgetPassword = requestPasswordReset;

/**
 * Type definitions for Better Auth session
 */
export type AuthSession = Awaited<ReturnType<typeof getSession>>;
export type AuthUser = NonNullable<AuthSession>['user'];
