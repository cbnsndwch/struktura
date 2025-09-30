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
    Input
} from '@cbnsndwch/struktura-shared-ui';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

import { PasswordStrengthIndicator } from 'app/components/auth/PasswordStrengthIndicator.js';
import type { ResetPasswordFormData } from 'app/lib/validations/auth.js';

interface FormStateProps {
    form: UseFormReturn<ResetPasswordFormData>;
    onSubmit: (data: ResetPasswordFormData) => Promise<void>;
    resetStatus: 'form' | 'submitting' | 'error';
    errorMessage?: string;
    showPassword: boolean;
    showConfirmPassword: boolean;
    onToggleShowPassword: () => void;
    onToggleShowConfirmPassword: () => void;
    newPassword: string;
    showPasswordStrength: boolean;
    onNavigateToLogin: () => void;
}

export function FormState({
    form,
    onSubmit,
    resetStatus,
    errorMessage,
    showPassword,
    showConfirmPassword,
    onToggleShowPassword,
    onToggleShowConfirmPassword,
    newPassword,
    showPasswordStrength,
    onNavigateToLogin
}: FormStateProps) {
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
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            {resetStatus === 'error' && errorMessage && (
                                <Alert variant="destructive">
                                    {errorMessage}
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
                                                    type={
                                                        showPassword
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    placeholder="Enter your new password"
                                                    {...field}
                                                    disabled={
                                                        resetStatus ===
                                                        'submitting'
                                                    }
                                                    data-testid="new-password-input"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={
                                                        onToggleShowPassword
                                                    }
                                                    disabled={
                                                        resetStatus ===
                                                        'submitting'
                                                    }
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
                                        {showPasswordStrength && (
                                            <PasswordStrengthIndicator
                                                password={newPassword}
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
                                        <FormLabel>
                                            Confirm New Password
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={
                                                        showConfirmPassword
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    placeholder="Confirm your new password"
                                                    {...field}
                                                    disabled={
                                                        resetStatus ===
                                                        'submitting'
                                                    }
                                                    data-testid="confirm-password-input"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={
                                                        onToggleShowConfirmPassword
                                                    }
                                                    disabled={
                                                        resetStatus ===
                                                        'submitting'
                                                    }
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
                                disabled={resetStatus === 'submitting'}
                                data-testid="reset-password-button"
                            >
                                {resetStatus === 'submitting' && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Reset Password
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">
                            Remember your password?{' '}
                        </span>
                        <button
                            type="button"
                            onClick={onNavigateToLogin}
                            className="text-primary underline underline-offset-4 hover:no-underline"
                        >
                            Sign in
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
