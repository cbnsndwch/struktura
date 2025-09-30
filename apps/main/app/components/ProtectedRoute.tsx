/**
 * Protected route component that handles authentication and authorization
 * Provides loading states, redirects, and deep link preservation
 */
import { useEffect, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Loader2 } from 'lucide-react';

import { useAuth } from '../lib/auth-context.js';
import { isPublicRoute } from '../lib/auth.js';

interface ProtectedRouteProps {
    children: ReactNode;
    /** Required roles for accessing this route */
    requiredRoles?: string[];
    /** Custom redirect path on auth failure */
    redirectTo?: string;
    /** Whether to show loading spinner during auth check */
    showLoader?: boolean;
}

/**
 * ProtectedRoute wrapper component
 *
 * Usage:
 * ```tsx
 * <ProtectedRoute requiredRoles={['admin']}>
 *   <AdminPanel />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
    children,
    requiredRoles = [],
    redirectTo = '/auth/login',
    showLoader = true
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Skip if still loading
        if (isLoading) return;

        // Skip if route is public
        if (isPublicRoute(location.pathname)) {
            return;
        }

        // Redirect if not authenticated
        if (!isAuthenticated) {
            const loginUrl = new URL(redirectTo, window.location.origin);
            if (location.pathname !== redirectTo) {
                loginUrl.searchParams.set(
                    'redirectTo',
                    location.pathname + location.search
                );
            }
            navigate(loginUrl.pathname + loginUrl.search, { replace: true });
            return;
        }

        // Check role-based access if required
        if (requiredRoles.length > 0 && user) {
            const hasRequiredRole = requiredRoles.some(role =>
                user.roles.includes(role)
            );

            if (!hasRequiredRole) {
                // User is authenticated but doesn't have required role
                navigate('/unauthorized', { replace: true });
                return;
            }
        }
    }, [
        isAuthenticated,
        isLoading,
        user,
        requiredRoles,
        location.pathname,
        location.search,
        navigate,
        redirectTo
    ]);

    // Show loading state while checking authentication
    if (isLoading && showLoader) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">
                        Verifying authentication...
                    </p>
                </div>
            </div>
        );
    }

    // If not loading and not authenticated, don't render children
    // (useEffect will handle redirect)
    if (!isLoading && !isAuthenticated && !isPublicRoute(location.pathname)) {
        return null;
    }

    // Render children if authenticated (or route is public)
    return <>{children}</>;
}

/**
 * Higher-order component version of ProtectedRoute
 *
 * Usage:
 * ```tsx
 * const ProtectedAdminPanel = withProtectedRoute(AdminPanel, { requiredRoles: ['admin'] });
 * ```
 */
export function withProtectedRoute<P extends object>(
    Component: React.ComponentType<P>,
    options: Omit<ProtectedRouteProps, 'children'> = {}
) {
    return function ProtectedComponent(props: P) {
        return (
            <ProtectedRoute {...options}>
                <Component {...props} />
            </ProtectedRoute>
        );
    };
}
