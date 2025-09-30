import { useState } from 'react';
import type { MetaFunction, LoaderFunctionArgs } from 'react-router';
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
    Checkbox,
    Alert
} from '@cbnsndwch/struktura-shared-ui';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import {
    signupSchema,
    type SignupFormData
} from '../../lib/validations/auth.js';

import { PasswordStrengthIndicator } from '../../components/auth/PasswordStrengthIndicator.js';
import OAuthButtons from '../../components/auth/OAuthButtons.js';
import { redirectIfAuthenticated } from '../../lib/auth.js';

export const meta: MetaFunction = () => {
    return [
        { title: 'Sign Up • Struktura' },
        {
            name: 'description',
            content:
                'Create your free Struktura account and start building better data workflows today.'
        }
    ];
};

export async function loader({ request }: LoaderFunctionArgs) {
    // Redirect authenticated users to workspaces
    redirectIfAuthenticated(request);
    return null;
}

export default function Signup() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: '',
            name: '',
            password: '',
            confirmPassword: '',
            acceptTerms: false
        }
    });

    const onSubmit = async (data: SignupFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: data.email,
                    name: data.name,
                    password: data.password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            // Registration successful
            await response.json();

            // Store email for potential resend verification
            localStorage.setItem('pendingVerificationEmail', data.email);

            // Redirect to login with email verification message
            window.location.href =
                '/auth/login?message=Registration successful! Please check your email to verify your account before signing in.';
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">
                        Create Account
                    </CardTitle>
                    <p className="text-muted-foreground">
                        Start your free Struktura account
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <OAuthButtons disabled={isLoading} />

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            {error && (
                                <Alert variant="destructive">{error}</Alert>
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
                                                data-testid="email-input"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your full name"
                                                {...field}
                                                disabled={isLoading}
                                                data-testid="name-input"
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
                                                    placeholder="Create a strong password"
                                                    {...field}
                                                    disabled={isLoading}
                                                    data-testid="password-input"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                    disabled={isLoading}
                                                    data-testid="toggle-password-visibility"
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
                                        {field.value && (
                                            <PasswordStrengthIndicator
                                                password={field.value}
                                            />
                                        )}
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={
                                                        showConfirmPassword
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    placeholder="Confirm your password"
                                                    {...field}
                                                    disabled={isLoading}
                                                    data-testid="confirm-password-input"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() =>
                                                        setShowConfirmPassword(
                                                            !showConfirmPassword
                                                        )
                                                    }
                                                    disabled={isLoading}
                                                    data-testid="toggle-confirm-password-visibility"
                                                >
                                                    {showConfirmPassword ? (
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

                            <FormField
                                control={form.control}
                                name="acceptTerms"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isLoading}
                                                data-testid="accept-terms-checkbox"
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="text-sm font-normal">
                                                I agree to the{' '}
                                                <a
                                                    href="/terms"
                                                    className="text-primary underline underline-offset-4 hover:no-underline"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Terms of Service
                                                </a>{' '}
                                                and{' '}
                                                <a
                                                    href="/privacy"
                                                    className="text-primary underline underline-offset-4 hover:no-underline"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Privacy Policy
                                                </a>
                                            </FormLabel>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                                data-testid="signup-button"
                            >
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Create Account
                            </Button>
                        </form>
                    </Form>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">
                            Already have an account?{' '}
                        </span>
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
