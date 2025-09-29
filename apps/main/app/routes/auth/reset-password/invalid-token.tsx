import { useCallback, useMemo } from 'react';
import type { MetaFunction } from 'react-router';
import { useLocation, useNavigate } from 'react-router';

import { InvalidTokenState } from './components/InvalidTokenState.js';

export const meta: MetaFunction = () => {
    return [
        { title: 'Invalid Reset Link • Struktura' },
        {
            name: 'description',
            content: 'The password reset link is invalid or has expired.'
        }
    ];
};

export default function InvalidTokenRoute() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigateToLogin = useCallback(() => {
        navigate('/auth/login');
    }, [navigate]);

    // Get error message from URL search params if available
    const message = useMemo(() => {
        const searchParams = new URLSearchParams(location.search);
        return (
            searchParams.get('message') ||
            'Invalid or missing reset token. Please check your email link.'
        );
    }, [location.search]);

    return (
        <InvalidTokenState
            message={message}
            onNavigateToLogin={handleNavigateToLogin}
        />
    );
}
