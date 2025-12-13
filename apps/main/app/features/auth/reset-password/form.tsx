import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { MetaFunction } from 'react-router';
import { useLocation, useNavigate } from 'react-router';

import {
    resetPasswordSchema,
    type ResetPasswordFormData
} from '../../../lib/validations/auth.js';
import { resetPassword } from '../../../lib/auth-client.js';

import { FormState } from './components/FormState.js';

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

type ResetStatus = 'form' | 'submitting' | 'error';

interface ResetState {
    status: ResetStatus;
    message?: string;
}

export default function FormRoute() {
    const navigate = useNavigate();
    const location = useLocation();

    const [resetState, setResetState] = useState<ResetState>({
        status: 'form'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            token: '',
            newPassword: '',
            confirmPassword: ''
        }
    });

    const newPassword = form.watch('newPassword');

    // Get token from URL search params
    const token = useMemo(() => {
        const searchParams = new URLSearchParams(location.search);
        return searchParams.get('token');
    }, [location.search]);

    // Memoized values for password strength indication
    const showPasswordStrength = useMemo(
        () => Boolean(newPassword),
        [newPassword]
    );

    // Memoized toggle functions
    const toggleShowPassword = useCallback(() => {
        setShowPassword(!showPassword);
    }, [showPassword]);

    const toggleShowConfirmPassword = useCallback(() => {
        setShowConfirmPassword(!showConfirmPassword);
    }, [showConfirmPassword]);

    // Memoized navigation functions
    const handleNavigateToLogin = useCallback(() => {
        navigate('/auth/login');
    }, [navigate]);

    useEffect(() => {
        if (!token) {
            navigate('/auth/reset-password/invalid-token');
            return;
        }

        form.setValue('token', token);
    }, [form, token, navigate]);

    const onSubmit = useCallback(
        async (data: ResetPasswordFormData) => {
            setResetState({ status: 'submitting' });

            try {
                const result = await resetPassword({
                    token: data.token,
                    newPassword: data.newPassword
                });

                if (result.error) {
                    setResetState({
                        status: 'error',
                        message:
                            result.error.message ||
                            'Password reset failed. Please try again.'
                    });
                } else {
                    // Navigate to success route with message
                    navigate(
                        `/auth/reset-password/success?message=${encodeURIComponent(
                            'Password reset successfully!'
                        )}`
                    );
                }
            } catch {
                setResetState({
                    status: 'error',
                    message: 'Network error occurred. Please try again.'
                });
            }
        },
        [navigate]
    );

    // Don't render anything if no token (will redirect)
    if (!token) {
        return null;
    }

    return (
        <FormState
            form={form}
            onSubmit={onSubmit}
            resetStatus={resetState.status}
            errorMessage={resetState.message}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            onToggleShowPassword={toggleShowPassword}
            onToggleShowConfirmPassword={toggleShowConfirmPassword}
            newPassword={newPassword}
            showPasswordStrength={showPasswordStrength}
            onNavigateToLogin={handleNavigateToLogin}
        />
    );
}
