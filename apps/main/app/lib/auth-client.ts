/**
 * Better Auth Client for React
 *
 * This module provides the Better Auth client configured for the Struktura frontend.
 * It replaces the previous JWT-based authentication with session-based auth.
 */
import { createAuthClient } from 'better-auth/react';

// Extended client interface to include all available methods
// (The base types may not expose all runtime methods)
interface ExtendedAuthClient {
    signIn: {
        email: (options: {
            email: string;
            password: string;
            rememberMe?: boolean;
            callbackURL?: string;
        }) => Promise<{ data: unknown; error: { message: string } | null }>;
        social: (options: {
            provider: string;
            callbackURL?: string;
        }) => Promise<{ data: unknown; error: { message: string } | null }>;
    };
    signUp: {
        email: (options: {
            name: string;
            email: string;
            password: string;
            image?: string;
            callbackURL?: string;
        }) => Promise<{ data: unknown; error: { message: string } | null }>;
    };
    signOut: (options?: {
        fetchOptions?: { onSuccess?: () => void };
    }) => Promise<void>;
    useSession: () => {
        data: { user: AuthUser; session: unknown } | null;
        isPending: boolean;
        error: Error | null;
        refetch: () => void;
    };
    getSession: () => Promise<{ user: AuthUser; session: unknown } | null>;
    resetPassword: (options: {
        newPassword: string;
        token: string;
    }) => Promise<{ data: unknown; error: { message: string } | null }>;
    forgetPassword: (options: {
        email: string;
        redirectTo?: string;
    }) => Promise<{ data: unknown; error: { message: string } | null }>;
    requestPasswordReset: (options: {
        email: string;
        redirectTo?: string;
    }) => Promise<{ data: unknown; error: { message: string } | null }>;
    sendVerificationEmail: (options: {
        email: string;
        callbackURL?: string;
    }) => Promise<{ data: unknown; error: { message: string } | null }>;
}

/**
 * Better Auth client instance
 *
 * The client automatically handles:
 * - Session management with httpOnly cookies
 * - Automatic token refresh
 * - Sign in/up/out flows
 * - Session state via React hooks
 */
const _authClient = createAuthClient({
    // Base URL is automatically detected when running on same domain
    // For development, the frontend and backend are on the same origin (localhost:3007)
    baseURL:
        typeof window !== 'undefined' ? window.location.origin : undefined
});

// Cast to extended interface for proper typing
export const authClient = _authClient as unknown as ExtendedAuthClient;

// Export individual methods for convenience
export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;
export const useSession = authClient.useSession;
export const getSession = authClient.getSession;
export const resetPassword = authClient.resetPassword;
export const forgetPassword = authClient.forgetPassword;
export const requestPasswordReset = authClient.requestPasswordReset;
export const signInWithSocial = authClient.signIn.social;
export const sendVerificationEmail = authClient.sendVerificationEmail;

/**
 * Type definitions for Better Auth session
 */
export interface AuthUser {
    id: string;
    email: string;
    name?: string;
    image?: string;
    emailVerified?: boolean;
    roles?: string;
}

export type AuthSession = Awaited<ReturnType<typeof getSession>>;
