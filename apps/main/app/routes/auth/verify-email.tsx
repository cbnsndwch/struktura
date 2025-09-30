import { ArrowRight, CheckCircle, Loader2, Mail, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { MetaFunction } from 'react-router';

import {
    Alert,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@cbnsndwch/struktura-shared-ui';

export const meta: MetaFunction = () => {
    return [
        { title: 'Verify Email • Struktura' },
        {
            name: 'description',
            content:
                'Verify your email address to complete your Struktura account setup.'
        }
    ];
};

type VerificationStatus =
    | 'verifying'
    | 'success'
    | 'error'
    | 'expired'
    | 'invalid';

interface VerificationState {
    status: VerificationStatus;
    message: string;
    userEmail?: string;
}

export default function VerifyEmail() {
    const [verificationState, setVerificationState] =
        useState<VerificationState>({
            status: 'verifying',
            message: 'Verifying your email address...'
        });
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    useEffect(() => {
        // Get token from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
            setVerificationState({
                status: 'invalid',
                message:
                    'No verification token provided. Please check your email link.'
            });
            return;
        }

        // Verify email with backend
        const verifyEmail = async () => {
            try {
                const response = await fetch(
                    `/auth/verify-email?token=${encodeURIComponent(token)}`
                );

                if (response.ok) {
                    const result = await response.json();
                    setVerificationState({
                        status: 'success',
                        message:
                            result.message || 'Email verified successfully!'
                    });

                    // Redirect to login after a delay
                    setTimeout(() => {
                        window.location.href =
                            '/auth/login?message=Email verified! You can now sign in.';
                    }, 3000);
                } else {
                    const errorData = await response.json();
                    const isExpired = errorData.message
                        ?.toLowerCase()
                        .includes('expired');

                    setVerificationState({
                        status: isExpired ? 'expired' : 'error',
                        message:
                            errorData.message || 'Email verification failed'
                    });
                }
            } catch {
                setVerificationState({
                    status: 'error',
                    message: 'Network error occurred. Please try again.'
                });
            }
        };

        verifyEmail();
    }, []);

    const handleResendVerification = async () => {
        // Try to get email from URL parameters or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const email =
            urlParams.get('email') ||
            localStorage.getItem('pendingVerificationEmail');

        if (!email) {
            setVerificationState(prev => ({
                ...prev,
                message:
                    'Cannot resend verification email. Please try signing up again.'
            }));
            return;
        }

        setIsResending(true);
        setResendSuccess(false);

        try {
            // Note: We'll need to add a resend endpoint to the backend
            // For now, we'll use the registration endpoint to trigger a new verification email
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    name: 'Resend Verification', // Placeholder
                    password: 'temp-password-for-resend' // Placeholder
                })
            });

            if (response.ok) {
                setResendSuccess(true);
                setVerificationState(prev => ({
                    ...prev,
                    message:
                        'A new verification email has been sent to your email address.'
                }));
            } else if (response.status === 409) {
                // 409 = user already exists
                setVerificationState(prev => ({
                    ...prev,
                    message:
                        'Account already exists. Please check your email for a previous verification message or try logging in.'
                }));
            } else {
                throw new Error('Failed to resend verification email');
            }
        } catch {
            setVerificationState(prev => ({
                ...prev,
                message:
                    'Failed to resend verification email. Please try again.'
            }));
        } finally {
            setIsResending(false);
        }
    };

    const getStatusIcon = () => {
        switch (verificationState.status) {
            case 'verifying':
                return (
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                );
            case 'success':
                return <CheckCircle className="h-12 w-12 text-green-600" />;
            case 'error':
            case 'expired':
            case 'invalid':
                return <XCircle className="h-12 w-12 text-red-600" />;
            default:
                return <Mail className="h-12 w-12 text-gray-400" />;
        }
    };

    const getStatusMessage = () => {
        switch (verificationState.status) {
            case 'success':
                return (
                    <div className="text-center space-y-2">
                        <p className="text-green-700 font-medium">
                            {verificationState.message}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Redirecting you to sign in...
                        </p>
                    </div>
                );
            case 'expired':
                return (
                    <div className="text-center space-y-4">
                        <p className="text-red-700 font-medium">
                            {verificationState.message}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Your verification link has expired. You can request
                            a new one below.
                        </p>
                    </div>
                );
            case 'error':
            case 'invalid':
                return (
                    <div className="text-center space-y-2">
                        <p className="text-red-700 font-medium">
                            {verificationState.message}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Please check your email link or contact support if
                            the problem persists.
                        </p>
                    </div>
                );
            default:
                return (
                    <p className="text-center text-muted-foreground">
                        {verificationState.message}
                    </p>
                );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        {getStatusIcon()}
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        Email Verification
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {getStatusMessage()}

                    {resendSuccess && (
                        <Alert>
                            <Mail className="h-4 w-4" />
                            <div>
                                <p className="font-medium">
                                    Verification email sent!
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Please check your email and click the
                                    verification link.
                                </p>
                            </div>
                        </Alert>
                    )}

                    <div className="space-y-3">
                        {(verificationState.status === 'expired' ||
                            verificationState.status === 'error') && (
                            <Button
                                onClick={handleResendVerification}
                                disabled={isResending}
                                className="w-full"
                                variant="outline"
                            >
                                {isResending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Resend Verification Email
                            </Button>
                        )}

                        <Button
                            onClick={() =>
                                (window.location.href = '/auth/login')
                            }
                            className="w-full"
                            variant={
                                verificationState.status === 'success'
                                    ? 'outline'
                                    : 'default'
                            }
                        >
                            Go to Sign In
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">
                                Need help?{' '}
                            </span>
                            <a
                                href="/support"
                                className="text-primary underline underline-offset-4 hover:no-underline"
                            >
                                Contact Support
                            </a>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
