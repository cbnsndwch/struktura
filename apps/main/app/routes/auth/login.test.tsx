import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import Login from './login.js';

// Mock fetch globally
global.fetch = vi.fn();

// Mock Sonner toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    },
    Toaster: () => null
}));

// Mock React Router
const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
    useNavigate: () => mockNavigate
}));

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Remove the alert mock since we're using toasts now
        Object.defineProperty(window, 'location', {
            value: {
                href: '',
                search: ''
            },
            writable: true
        });
        Object.defineProperty(window, 'localStorage', {
            value: {
                setItem: vi.fn(),
                getItem: vi.fn(),
                removeItem: vi.fn()
            },
            writable: true
        });
    });

    it('renders login form with all fields', () => {
        render(<Login />);

        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByTestId('login-email-input')).toBeInTheDocument();
        expect(screen.getByTestId('login-password-input')).toBeInTheDocument();
        expect(screen.getByTestId('login-button')).toBeInTheDocument();
        expect(
            screen.getByTestId('forgot-password-button')
        ).toBeInTheDocument();
    });

    it('renders OAuth buttons', () => {
        render(<Login />);

        expect(screen.getByTestId('google-oauth-button')).toBeInTheDocument();
        expect(screen.getByTestId('github-oauth-button')).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', async () => {
        render(<Login />);

        // Get form elements
        const emailInput = screen.getByTestId('login-email-input');
        const passwordInput = screen.getByTestId('login-password-input');
        const submitButton = screen.getByTestId('login-button');

        // Focus and blur inputs to trigger validation
        fireEvent.focus(emailInput);
        fireEvent.blur(emailInput);
        fireEvent.focus(passwordInput);
        fireEvent.blur(passwordInput);

        // Submit the form
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Email is required')).toBeInTheDocument();
            expect(
                screen.getByText('Password is required')
            ).toBeInTheDocument();
        });
    });

    it('shows validation error for invalid email', async () => {
        render(<Login />);

        const emailInput = screen.getByTestId('login-email-input');
        const submitButton = screen.getByTestId('login-button');

        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.blur(emailInput);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(
                screen.getByText('Please enter a valid email address')
            ).toBeInTheDocument();
        });
    });

    it('toggles password visibility', () => {
        render(<Login />);

        const passwordInput = screen.getByTestId('login-password-input');
        const toggleButton = screen.getByTestId(
            'toggle-login-password-visibility'
        );

        expect(passwordInput).toHaveAttribute('type', 'password');

        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');

        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('shows forgot password form when forgot password button is clicked', () => {
        render(<Login />);

        const forgotPasswordButton = screen.getByTestId(
            'forgot-password-button'
        );
        fireEvent.click(forgotPasswordButton);

        // Check that forgot password form is shown
        expect(
            screen.getByTestId('forgot-password-email-input')
        ).toBeInTheDocument();
        expect(screen.getByTestId('back-to-login-button')).toBeInTheDocument();
        expect(
            screen.getByTestId('send-reset-email-button')
        ).toBeInTheDocument();

        // Check that login form is hidden
        expect(screen.queryByTestId('login-button')).not.toBeInTheDocument();
    });

    it('returns to login form when back button is clicked', () => {
        render(<Login />);

        // Go to forgot password form
        const forgotPasswordButton = screen.getByTestId(
            'forgot-password-button'
        );
        fireEvent.click(forgotPasswordButton);

        // Click back button
        const backButton = screen.getByTestId('back-to-login-button');
        fireEvent.click(backButton);

        // Check that login form is shown again
        expect(screen.getByTestId('login-button')).toBeInTheDocument();
        expect(
            screen.queryByTestId('send-reset-email-button')
        ).not.toBeInTheDocument();
    });

    it('shows error when trying to reset password without email', async () => {
        const { toast } = await import('sonner');
        render(<Login />);

        // Go to forgot password form
        const forgotPasswordButton = screen.getByTestId(
            'forgot-password-button'
        );
        fireEvent.click(forgotPasswordButton);

        // Try to send reset email without entering email
        const sendResetButton = screen.getByTestId('send-reset-email-button');
        fireEvent.click(sendResetButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                'Please enter your email address first'
            );
        });
    });

    it('sends password reset request successfully', async () => {
        const { toast } = await import('sonner');
        const mockFetch = vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ message: 'Reset email sent' })
        } as Response);

        render(<Login />);

        // Go to forgot password form
        const forgotPasswordButton = screen.getByTestId(
            'forgot-password-button'
        );
        fireEvent.click(forgotPasswordButton);

        // Enter email
        const emailInput = screen.getByTestId('forgot-password-email-input');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        // Send reset email
        const sendResetButton = screen.getByTestId('send-reset-email-button');
        fireEvent.click(sendResetButton);

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                '/auth/password-reset/request',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: 'test@example.com' })
                }
            );
            expect(toast.success).toHaveBeenCalledWith(
                'Reset email sent successfully!',
                {
                    description:
                        'Check your inbox for password reset instructions.'
                }
            );
        });

        // Should return to login form
        expect(screen.getByTestId('login-button')).toBeInTheDocument();
    });

    it('handles password reset request error', async () => {
        const { toast } = await import('sonner');
        const mockFetch = vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({ message: 'User not found' })
        } as Response);

        render(<Login />);

        // Go to forgot password form
        const forgotPasswordButton = screen.getByTestId(
            'forgot-password-button'
        );
        fireEvent.click(forgotPasswordButton);

        // Enter email
        const emailInput = screen.getByTestId('forgot-password-email-input');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        // Send reset email
        const sendResetButton = screen.getByTestId('send-reset-email-button');
        fireEvent.click(sendResetButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('User not found');
        });
    });

    it('handles successful login with toast notification', async () => {
        const { toast } = await import('sonner');
        const mockFetch = vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () =>
                Promise.resolve({
                    access_token: 'fake-token',
                    refresh_token: 'fake-refresh-token'
                })
        } as Response);

        render(<Login />);

        // Fill in valid credentials
        const emailInput = screen.getByTestId('login-email-input');
        const passwordInput = screen.getByTestId('login-password-input');
        const submitButton = screen.getByTestId('login-button');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith(
                'Successfully signed in! Redirecting...'
            );
            expect(window.localStorage.setItem).toHaveBeenCalledWith(
                'access_token',
                'fake-token'
            );
            expect(window.localStorage.setItem).toHaveBeenCalledWith(
                'refresh_token',
                'fake-refresh-token'
            );
        });
    });

    it('handles login error with toast notification', async () => {
        const { toast } = await import('sonner');
        const mockFetch = vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({ message: 'Invalid credentials' })
        } as Response);

        render(<Login />);

        // Fill in credentials
        const emailInput = screen.getByTestId('login-email-input');
        const passwordInput = screen.getByTestId('login-password-input');
        const submitButton = screen.getByTestId('login-button');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('User not found');
        });
    });
});
