/**
 * Server-side authentication utilities for React Router 7
 * These functions work with cookies and can be used in loaders/actions
 */
import jwt from 'jsonwebtoken';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';

export interface ServerAuthUser {
    id: string;
    email: string;
    name: string;
    roles: string[];
    emailVerified: boolean;
}

export interface ServerAuthResult {
    isAuthenticated: boolean;
    user: ServerAuthUser | null;
    needsRefresh: boolean;
}

/**
 * Extract cookies from request headers
 */
function parseCookies(request: Request): Record<string, string> {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return {};

    return cookieHeader
        .split(';')
        .map(cookie => cookie.trim().split('='))
        .reduce((acc, [key, value]) => {
            if (key && value) {
                acc[key] = decodeURIComponent(value);
            }
            return acc;
        }, {} as Record<string, string>);
}

interface JWTPayload {
    sub: string;
    email: string;
    name: string;
    roles?: string[];
    emailVerified?: boolean;
    exp: number;
    iat: number;
}

/**
 * Verify JWT token and extract user data
 */
function verifyToken(token: string): ServerAuthUser | null {
    try {
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jwt.verify(token, secret) as JWTPayload;
        
        return {
            id: decoded.sub,
            email: decoded.email,
            name: decoded.name,
            roles: decoded.roles || [],
            emailVerified: decoded.emailVerified || false
        };
    } catch {
        return null;
    }
}

/**
 * Check if JWT token is expired or about to expire (within 5 minutes)
 */
function isTokenExpiringSoon(token: string): boolean {
    try {
        const decoded = jwt.decode(token) as JWTPayload | null;
        if (!decoded || !decoded.exp) return true;
        
        const expirationTime = decoded.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        return (expirationTime - currentTime) < fiveMinutes;
    } catch {
        return true;
    }
}

/**
 * Get authentication state from cookies (server-side)
 * This is the main function to use in React Router 7 loaders
 */
export function getServerAuth(request: Request): ServerAuthResult {
    const cookies = parseCookies(request);
    const accessToken = cookies.access_token;
    const refreshToken = cookies.refresh_token;

    // No access token means not authenticated
    if (!accessToken) {
        return {
            isAuthenticated: false,
            user: null,
            needsRefresh: false
        };
    }

    // Try to verify the access token
    const user = verifyToken(accessToken);
    
    if (user) {
        // Token is valid, check if it needs refresh soon
        const needsRefresh = isTokenExpiringSoon(accessToken) && !!refreshToken;
        
        return {
            isAuthenticated: true,
            user,
            needsRefresh
        };
    }

    // Access token is invalid, but we have a refresh token
    if (refreshToken) {
        return {
            isAuthenticated: false,
            user: null,
            needsRefresh: true
        };
    }

    // No valid tokens
    return {
        isAuthenticated: false,
        user: null,
        needsRefresh: false
    };
}

/**
 * Require authentication in a loader
 * Redirects to login if not authenticated
 */
export function requireServerAuth(request: Request, redirectTo = '/auth/login') {
    const auth = getServerAuth(request);
    
    if (!auth.isAuthenticated) {
        const url = new URL(request.url);
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
export function redirectIfServerAuthenticated(
    request: Request, 
    defaultRedirect = '/workspaces'
) {
    const auth = getServerAuth(request);
    
    if (auth.isAuthenticated) {
        const url = new URL(request.url);
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
 * Helper to extract authentication from loader/action args
 */
export function getAuthFromArgs(args: LoaderFunctionArgs | ActionFunctionArgs): ServerAuthResult {
    return getServerAuth(args.request);
}

/**
 * Check if user has specific role
 */
export function hasRole(auth: ServerAuthResult, role: string): boolean {
    return auth.isAuthenticated && auth.user?.roles.includes(role) || false;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(auth: ServerAuthResult, roles: string[]): boolean {
    return auth.isAuthenticated && roles.some(role => auth.user?.roles.includes(role)) || false;
}