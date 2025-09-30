import { useCallback, useMemo } from 'react';
import type { MetaFunction } from 'react-router';
import { useLocation, useNavigate } from 'react-router';

import { SuccessState } from './components/SuccessState.js';

export const meta: MetaFunction = () => {
    return [
        { title: 'Password Reset Complete • Struktura' },
        {
            name: 'description',
            content: 'Your password has been successfully reset.'
        }
    ];
};

export default function SuccessRoute() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigateToLogin = useCallback(() => {
        navigate(
            '/auth/login?message=Password reset successfully! Please sign in with your new password.'
        );
    }, [navigate]);

    // Get success message from URL search params if available
    const message = useMemo(() => {
        const searchParams = new URLSearchParams(location.search);
        return searchParams.get('message') || 'Password reset successfully!';
    }, [location.search]);

    return (
        <SuccessState
            message={message}
            onNavigateToLogin={handleNavigateToLogin}
        />
    );
}
