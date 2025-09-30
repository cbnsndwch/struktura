import { useEffect, useMemo } from 'react';
import type { MetaFunction } from 'react-router';
import { useLocation, useNavigate } from 'react-router';

export const meta: MetaFunction = () => {
    return [
        { title: 'Reset Password • Struktura' },
        {
            name: 'description',
            content:
                'Reset your Struktura account password with a secure new password.'
        }
    ];
};

export default function ResetPasswordIndex() {
    const navigate = useNavigate();
    const location = useLocation();

    // Get parameters from URL
    const searchParams = useMemo(() => {
        return new URLSearchParams(location.search);
    }, [location.search]);

    const token = useMemo(() => {
        return searchParams.get('token');
    }, [searchParams]);

    const status = useMemo(() => {
        return searchParams.get('status');
    }, [searchParams]);

    useEffect(() => {
        // Determine which route to redirect to based on URL parameters
        if (status === 'success') {
            // Redirect to success route with any message
            const message = searchParams.get('message');
            const successUrl = message
                ? `/auth/reset-password/success?message=${encodeURIComponent(message)}`
                : '/auth/reset-password/success';
            navigate(successUrl, { replace: true });
        } else if (!token || status === 'invalid') {
            // Redirect to invalid token route with any error message
            const message = searchParams.get('message');
            const invalidUrl = message
                ? `/auth/reset-password/invalid-token?message=${encodeURIComponent(message)}`
                : '/auth/reset-password/invalid-token';
            navigate(invalidUrl, { replace: true });
        } else {
            // Redirect to form route with token
            navigate(
                `/auth/reset-password/form?token=${encodeURIComponent(token)}`,
                { replace: true }
            );
        }
    }, [navigate, token, status, searchParams]);

    // Show loading state while redirecting
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
            </div>
        </div>
    );
}
