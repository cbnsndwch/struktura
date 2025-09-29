import { z } from 'zod';

/**
 * Validation schema for login form
 */
export const loginSchema = z.object({
    email: z
        .email('Please enter a valid email address')
        .min(1, 'Email is required'),
    password: z.string().min(1, 'Password is required')
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Validation schema for signup form
 */
export const signupSchema = z
    .object({
        email: z
            .email('Please enter a valid email address')
            .min(1, 'Email is required'),
        name: z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name cannot exceed 100 characters'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(128, 'Password cannot exceed 128 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                'Password must contain at least one lowercase letter, one uppercase letter, and one number'
            ),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
        acceptTerms: z
            .boolean()
            .refine(
                val => val === true,
                'You must accept the terms of service and privacy policy'
            )
    })
    .refine(data => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword']
    });

export type SignupFormData = z.infer<typeof signupSchema>;

/**
 * Validation schema for password reset request
 */
export const passwordResetSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address')
});

export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

/**
 * Validation schema for password reset confirmation
 */
export const resetPasswordSchema = z
    .object({
        token: z.string().min(1, 'Reset token is required'),
        newPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(128, 'Password cannot exceed 128 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                'Password must contain at least one lowercase letter, one uppercase letter, and one number'
            ),
        confirmPassword: z.string().min(1, 'Please confirm your password')
    })
    .refine(data => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword']
    });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Password strength calculation
 */
export function calculatePasswordStrength(password: string): {
    score: number;
    label: string;
    color: string;
} {
    if (!password) {
        return {
            score: 0,
            label: 'Enter a password',
            color: 'text-muted-foreground'
        };
    }

    let score = 0;

    // Length check
    if (password.length >= 12) {
        score += 2;
    } else if (password.length >= 8) {
        score += 1;
    }

    // Character variety checks
    if (/[a-z]/.test(password)) {
        score += 1;
    }
    if (/[A-Z]/.test(password)) {
        score += 1;
    }
    if (/\d/.test(password)) {
        score += 1;
    }
    if (/[^a-zA-Z\d]/.test(password)) {
        score += 1;
    }

    if (score <= 2) {
        return {
            score,
            label: 'Weak',
            color: 'text-destructive'
        };
    }

    if (score <= 4) {
        return {
            score,
            label: 'Medium',
            color: 'text-yellow-600'
        };
    }

    return {
        score,
        label: 'Strong',
        color: 'text-green-600'
    };
}
