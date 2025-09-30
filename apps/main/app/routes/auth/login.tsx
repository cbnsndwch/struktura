import {
    Alert,
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
    Toaster
} from '@cbnsndwch/struktura-shared-ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import type { MetaFunction, LoaderFunctionArgs } from 'react-router';
import { toast } from 'sonner';

import OAuthButtons from '../../components/auth/OAuthButtons.js';
import { loginSchema, type LoginFormData } from '../../lib/validations/auth.js';
import { redirectIfAuthenticated } from '../../lib/auth.js';

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

export async function loader({ request }: LoaderFunctionArgs) {
    // Redirect authenticated users to workspaces
    redirectIfAuthenticated(request);
    return null;
}

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

    const onSubmit = useCallback(async (data: LoginFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            // Login successful
            const result = await response.json();

            // Store tokens and redirect to dashboard
            if (result.tokens?.accessToken) {
                localStorage.setItem('access_token', result.tokens.accessToken);
                if (result.tokens.refreshToken) {
                    localStorage.setItem(
                        'refresh_token',
                        result.tokens.refreshToken
                    );
                }
                toast.success('Successfully signed in! Redirecting...');
                window.location.href = '/dashboard';
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleForgotPassword = useCallback(async () => {
        const email = form.getValues('email');
        if (!email) {
            const errorMessage = 'Please enter your email address first';
            setError(errorMessage);
            toast.error(errorMessage);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/password-reset/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || 'Failed to send reset email'
                );
            }

            // Show success message and return to login form
            const successMessage =
                'Password reset instructions have been sent to your email address. Please check your inbox and follow the instructions to reset your password.';
            setSuccessMessage(successMessage);
            toast.success('Reset email sent successfully!', {
                description: 'Check your inbox for password reset instructions.'
            });
            setShowForgotPassword(false);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [form]);

    // Check for success message from signup
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Memoized callback functions
    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(!showPassword);
    }, [showPassword]);

    const showForgotPasswordForm = useCallback(() => {
        setShowForgotPassword(true);
    }, []);

    const handleBackToLogin = useCallback(() => {
        setShowForgotPassword(false);
        setError(null);
    }, []);

    const handleEmailChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            form.setValue('email', e.target.value);
        },
        [form]
    );

    // Handle URL parameters on client side only
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            setSuccessMessage(urlParams.get('message'));
        }
    }, []);

    return (
        <>
            <Toaster />
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

                        {!showForgotPassword ? (
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-4"
                                >
                                    {successMessage && (
                                        <Alert>{successMessage}</Alert>
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
                                                            type={
                                                                showPassword
                                                                    ? 'text'
                                                                    : 'password'
                                                            }
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
                                                            onClick={
                                                                togglePasswordVisibility
                                                            }
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
                                            onClick={showForgotPasswordForm}
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
                                        {isLoading && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Sign In
                                    </Button>
                                </form>
                            </Form>
                        ) : (
                            <div className="space-y-4">
                                {error && (
                                    <Alert variant="destructive">{error}</Alert>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Email Address
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={form.getValues('email')}
                                        onChange={handleEmailChange}
                                        disabled={isLoading}
                                        data-testid="forgot-password-email-input"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Enter your email address and we'll send
                                        you a link to reset your password.
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={handleBackToLogin}
                                        disabled={isLoading}
                                        data-testid="back-to-login-button"
                                    >
                                        Back to Sign In
                                    </Button>
                                    <Button
                                        type="button"
                                        className="flex-1"
                                        onClick={handleForgotPassword}
                                        disabled={isLoading}
                                        data-testid="send-reset-email-button"
                                    >
                                        {isLoading && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Send Reset Link
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">
                                Don't have an account?{' '}
                            </span>
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
        </>
    );
}
