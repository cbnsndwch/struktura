/**
 * Authentication utilities for React Router 7
 */
import { redirect } from 'react-router';

/**
 * Check if user is authenticated by looking for access token
 */
export function isAuthenticated(): boolean {
    if (typeof window === 'undefined') {
        // During SSR, we can't check localStorage
        return false;
    }
    
    try {
        const accessToken = localStorage.getItem('access_token');
        return !!accessToken;
    } catch {
        return false;
    }
}

/**
 * Protected route loader that redirects unauthenticated users to login
 * Use this in loaders for routes that require authentication
 */
export function requireAuth(request: Request) {
    const url = new URL(request.url);
    
    // Skip auth check during SSR - we'll handle it client-side
    if (typeof window === 'undefined') {
        return null;
    }
    
    if (!isAuthenticated()) {
        // Preserve the intended destination
        const redirectUrl = new URL('/auth/login', url.origin);
        if (url.pathname !== '/auth/login') {
            redirectUrl.searchParams.set('redirectTo', url.pathname + url.search);
        }
        throw redirect(redirectUrl.toString());
    }
    
    return null;
}

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
    '/auth/login',
    '/auth/signup',
    '/auth/verify-email',
    '/auth/reset-password',
    '/favicon.ico',
    '/ui-demo'
];

/**
 * Check if a route is public (doesn't require authentication)
 */
export function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some(route => 
        pathname === route || 
        pathname.startsWith(route + '/')
    );
}

/**
 * Redirect authenticated users away from auth pages
 * Use this in auth page loaders
 */
export function redirectIfAuthenticated(request: Request, defaultRedirect = '/workspaces') {
    if (typeof window !== 'undefined' && isAuthenticated()) {
        const url = new URL(request.url);
        const redirectTo = url.searchParams.get('redirectTo') || defaultRedirect;
        throw redirect(redirectTo);
    }
    
    return null;
}

/**
 * Client-side authentication check with redirect
 * Use this in useEffect hooks for immediate client-side protection  
 */
export function useAuthGuard(redirectTo = '/auth/login') {
    if (typeof window !== 'undefined' && !isAuthenticated()) {
        const currentUrl = window.location.pathname + window.location.search;
        if (!isPublicRoute(currentUrl)) {
            const loginUrl = new URL(redirectTo, window.location.origin);
            if (currentUrl !== redirectTo) {
                loginUrl.searchParams.set('redirectTo', currentUrl);
            }
            window.location.href = loginUrl.toString();
        }
    }
}