/**
 * Authentication utilities for React Router 7
 */
import { redirect } from 'react-router';

interface JWTPayload {
    exp?: number;
    iat?: number;
    [key: string]: unknown;
}

/**
 * Decode JWT token without verification (client-side only)
 */
function decodeJWT(token: string): JWTPayload | null {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        
        return JSON.parse(jsonPayload) as JWTPayload;
    } catch {
        return null;
    }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return true;
    
    // Check if token is expired (with 30 second buffer)
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const buffer = 30 * 1000; // 30 seconds
    
    return currentTime >= (expirationTime - buffer);
}

/**
 * Check if user is authenticated by looking for access token in localStorage or cookies
 */
export function isAuthenticated(): boolean {
    if (typeof window === 'undefined') {
        // During SSR, we can't check localStorage
        return false;
    }
    
    try {
        // First check localStorage (primary)
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            // Verify token is not expired
            if (!isTokenExpired(accessToken)) {
                return true;
            }
            // Token expired, clear it
            localStorage.removeItem('access_token');
        }
        
        // Fallback: check cookies for users who block localStorage
        const cookies = document.cookie
            .split(';')
            .map(cookie => cookie.trim().split('='))
            .reduce((acc, [key, value]) => {
                if (key && value) {
                    acc[key] = decodeURIComponent(value);
                }
                return acc;
            }, {} as Record<string, string>);
            
        if (cookies.access_token && !isTokenExpired(cookies.access_token)) {
            return true;
        }
        
        return false;
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
    '/',
    '/auth/login',
    '/auth/signup',
    '/auth/verify-email',
    '/auth/reset-password',
    '/favicon.ico',
    '/ui-demo',
    '/unauthorized'
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

/**
 * Attempt to refresh the access token using the refresh token
 * Returns true if refresh was successful, false otherwise
 */
export async function refreshAccessToken(): Promise<boolean> {
    if (typeof window === 'undefined') {
        return false;
    }

    try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            return false;
        }

        const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken }),
            credentials: 'include'
        });

        if (!response.ok) {
            // Refresh failed, clear tokens
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            return false;
        }

        const data = await response.json();
        
        if (data.tokens?.accessToken) {
            localStorage.setItem('access_token', data.tokens.accessToken);
            if (data.tokens.refreshToken) {
                localStorage.setItem('refresh_token', data.tokens.refreshToken);
            }
            return true;
        }

        return false;
    } catch (error) {
        console.error('Token refresh failed:', error);
        // Clear tokens on error
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return false;
    }
}

/**
 * Check authentication and attempt refresh if token is expired
 * Returns true if user is authenticated (after potential refresh)
 */
export async function checkAuthWithRefresh(): Promise<boolean> {
    if (typeof window === 'undefined') {
        return false;
    }

    // First check if currently authenticated
    if (isAuthenticated()) {
        return true;
    }

    // If not authenticated, try to refresh
    const refreshed = await refreshAccessToken();
    
    // Check authentication again after refresh attempt
    return refreshed && isAuthenticated();
}