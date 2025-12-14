/**
 * Server-side authentication utilities for React Router 7
 *
 * Uses Better Auth session from the load context injected by the React Router handler.
 * This provides seamless authentication between NestJS and React Router loaders/actions.
 */
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';

import type { IUserPreferences } from '@cbnsndwch/struktura-auth-contracts';

import type { AppLoadContext } from '../../src/react-router.js';

export interface ServerAuthUser {
    id: string;
    email: string;
    name: string;
    roles: string[];
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
    preferences?: IUserPreferences;
}

export interface ServerAuthResult {
    isAuthenticated: boolean;
    user: ServerAuthUser | null;
}

/**
 * Get authentication state from Better Auth session via load context
 * This is the main async function to use in React Router 7 loaders
 */
export async function getServerAuth(
    args: LoaderFunctionArgs | ActionFunctionArgs
): Promise<ServerAuthResult> {
    const context = args.context as AppLoadContext;

    if (!context?.getSession) {
        console.warn(
            'getServerAuth: No getSession in load context. Is Better Auth initialized?'
        );
        return {
            isAuthenticated: false,
            user: null
        };
    }

    try {
        const session = await context.getSession();

        if (!session?.user) {
            return {
                isAuthenticated: false,
                user: null
            };
        }

        const preferences: IUserPreferences = {
            theme: 'system',
            ...session.user.preferences
        };

        return {
            isAuthenticated: true,
            user: {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                emailVerified: session.user.emailVerified,
                image: session.user.image,
                createdAt: session.user.createdAt,
                updatedAt: session.user.updatedAt,
                roles: session.user.roles || [],
                preferences
            }
        };
    } catch (error) {
        console.error('getServerAuth: Error getting session:', error);
        return {
            isAuthenticated: false,
            user: null
        };
    }
}

/**
 * Require authentication in a loader
 * Redirects to login if not authenticated
 */
export async function requireServerAuth(
    args: LoaderFunctionArgs | ActionFunctionArgs,
    redirectTo = '/auth/login'
): Promise<ServerAuthResult> {
    const auth = await getServerAuth(args);

    if (!auth.isAuthenticated) {
        const url = new URL(args.request.url);
        const loginUrl = new URL(redirectTo, url.origin);

        // Add redirect parameter if not already on auth pages
        if (!url.pathname.startsWith('/auth')) {
            loginUrl.searchParams.set('redirectTo', url.pathname + url.search);
        }

        throw new Response(null, {
            status: 302,
            headers: {
                Location: loginUrl.toString()
            }
        });
    }

    return auth;
}

/**
 * Redirect if already authenticated (for auth pages)
 * Use this in login/signup page loaders
 */
export async function redirectIfServerAuthenticated(
    args: LoaderFunctionArgs | ActionFunctionArgs,
    defaultRedirect = '/workspaces'
): Promise<void> {
    const auth = await getServerAuth(args);

    if (auth.isAuthenticated) {
        const url = new URL(args.request.url);
        const redirectUrl = new URL(defaultRedirect, url.origin);

        throw new Response(null, {
            status: 302,
            headers: {
                Location: redirectUrl.toString()
            }
        });
    }
}

/**
 * Check if user has specific role
 */
export function hasRole(auth: ServerAuthResult, role: string): boolean {
    return (auth.isAuthenticated && auth.user?.roles.includes(role)) || false;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(auth: ServerAuthResult, roles: string[]): boolean {
    return (
        (auth.isAuthenticated &&
            roles.some(role => auth.user?.roles.includes(role))) ||
        false
    );
}

/**
 * Extract cookie header from request for forwarding to API calls
 * Use this when making server-side API requests that need authentication
 */
export function getCookieHeader(
    args: LoaderFunctionArgs | ActionFunctionArgs
): string | undefined {
    return args.request.headers.get('cookie') ?? undefined;
}
