import React, { useState } from 'react';
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
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { loginSchema, type LoginFormData } from '~/lib/validations/auth';
import { OAuthButtons } from '~/components/auth/oauth-buttons';

export const meta: MetaFunction = () => {
    return [
        { title: 'Sign In • Struktura' },
        {
            name: 'description',
            content:
                'Sign in to your Struktura account to access your workspaces and collections.'
        }
    ];
};

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            // Login successful
            const result = await response.json();
            
            // Store tokens and redirect to dashboard
            if (result.access_token) {
                localStorage.setItem('access_token', result.access_token);
                if (result.refresh_token) {
                    localStorage.setItem('refresh_token', result.refresh_token);
                }
                window.location.href = '/dashboard';
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        const email = form.getValues('email');
        if (!email) {
            setError('Please enter your email address first');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/auth/password-reset/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to send reset email');
            }

            // Show success message
            alert('Password reset instructions have been sent to your email address.');
            setShowForgotPassword(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    // Check for success message from signup
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    // Handle URL parameters on client side only
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            setSuccessMessage(urlParams.get('message'));
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">
                        Welcome Back
                    </CardTitle>
                    <p className="text-muted-foreground">
                        Sign in to your Struktura account
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <OAuthButtons disabled={isLoading} />

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {successMessage && (
                                <Alert>
                                    {successMessage}
                                </Alert>
                            )}

                            {error && (
                                <Alert variant="destructive">
                                    {error}
                                </Alert>
                            )}

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="Enter your email"
                                                {...field}
                                                disabled={isLoading}
                                                data-testid="login-email-input"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="Enter your password"
                                                    {...field}
                                                    disabled={isLoading}
                                                    data-testid="login-password-input"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    disabled={isLoading}
                                                    data-testid="toggle-login-password-visibility"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center justify-between">
                                <Button
                                    type="button"
                                    variant="link"
                                    className="px-0 font-normal"
                                    onClick={handleForgotPassword}
                                    disabled={isLoading}
                                    data-testid="forgot-password-button"
                                >
                                    Forgot your password?
                                </Button>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full" 
                                disabled={isLoading}
                                data-testid="login-button"
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign In
                            </Button>
                        </form>
                    </Form>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">Don't have an account? </span>
                        <a
                            href="/auth/signup"
                            className="text-primary underline underline-offset-4 hover:no-underline"
                        >
                            Sign up
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
