import { useState, useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Alert
} from '@cbnsndwch/struktura-shared-ui';
import { Eye, EyeOff, Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

import { resetPasswordSchema, type ResetPasswordFormData } from '../../lib/validations/auth';
import { PasswordStrengthIndicator } from '../../components/auth/password-strength-indicator';

export const meta: MetaFunction = () => {
    return [
        { title: 'Reset Password • Struktura' },
        {
            name: 'description',
            content: 'Reset your Struktura account password with a secure new password.'
        }
    ];
};

type ResetStatus = 'form' | 'submitting' | 'success' | 'error' | 'invalid-token';

interface ResetState {
    status: ResetStatus;
    message?: string;
}

export default function ResetPassword() {
    const [resetState, setResetState] = useState<ResetState>({ status: 'form' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            token: '',
            newPassword: '',
            confirmPassword: ''
        }
    });

    const newPassword = form.watch('newPassword');

    useEffect(() => {
        // Get token from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const resetToken = urlParams.get('token');

        if (!resetToken) {
            setResetState({
                status: 'invalid-token',
                message: 'Invalid or missing reset token. Please check your email link.'
            });
            return;
        }

        setToken(resetToken);
        form.setValue('token', resetToken);
    }, [form]);

    const onSubmit = async (data: ResetPasswordFormData) => {
        setResetState({ status: 'submitting' });

        try {
            const response = await fetch('/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: data.token,
                    newPassword: data.newPassword
                }),
            });

            if (response.ok) {
                const result = await response.json();
                setResetState({
                    status: 'success',
                    message: result.message || 'Password reset successfully!'
                });

                // Redirect to login after a delay
                setTimeout(() => {
                    window.location.href = '/auth/login?message=Password reset successfully! Please sign in with your new password.';
                }, 3000);
            } else {
                const errorData = await response.json();
                setResetState({
                    status: 'error',
                    message: errorData.message || 'Password reset failed. Please try again.'
                });
            }
        } catch (error) {
            setResetState({
                status: 'error',
                message: 'Network error occurred. Please try again.'
            });
        }
    };

    // Invalid token state
    if (resetState.status === 'invalid-token') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <XCircle className="h-12 w-12 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            Invalid Reset Link
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center space-y-2">
                            <p className="text-red-700 font-medium">{resetState.message}</p>
                            <p className="text-sm text-muted-foreground">
                                The reset link may have expired or is invalid. Please request a new password reset.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={() => window.location.href = '/auth/login'}
                                className="w-full"
                            >
                                Back to Sign In
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>

                            <div className="text-center text-sm">
                                <span className="text-muted-foreground">Need help? </span>
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

    // Success state
    if (resetState.status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            Password Reset Complete
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center space-y-2">
                            <p className="text-green-700 font-medium">{resetState.message}</p>
                            <p className="text-sm text-muted-foreground">
                                Redirecting you to sign in with your new password...
                            </p>
                        </div>

                        <Button
                            onClick={() => window.location.href = '/auth/login'}
                            className="w-full"
                        >
                            Go to Sign In
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Form state
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">
                        Reset Your Password
                    </CardTitle>
                    <p className="text-muted-foreground">
                        Enter your new password below
                    </p>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {resetState.status === 'error' && resetState.message && (
                                <Alert variant="destructive">
                                    {resetState.message}
                                </Alert>
                            )}

                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="Enter your new password"
                                                    {...field}
                                                    disabled={resetState.status === 'submitting'}
                                                    data-testid="new-password-input"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    disabled={resetState.status === 'submitting'}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                        {newPassword && (
                                            <PasswordStrengthIndicator password={newPassword} />
                                        )}
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    placeholder="Confirm your new password"
                                                    {...field}
                                                    disabled={resetState.status === 'submitting'}
                                                    data-testid="confirm-password-input"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    disabled={resetState.status === 'submitting'}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button 
                                type="submit" 
                                className="w-full" 
                                disabled={resetState.status === 'submitting'}
                                data-testid="reset-password-button"
                            >
                                {resetState.status === 'submitting' && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Reset Password
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Remember your password? </span>
                        <a
                            href="/auth/login"
                            className="text-primary underline underline-offset-4 hover:no-underline"
                        >
                            Sign in
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}