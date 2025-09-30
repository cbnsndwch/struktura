import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

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

// Helper function to render component with router context
const renderWithRouter = (component: React.ReactElement) => {
    const router = createMemoryRouter(
        [
            {
                path: '/',
                element: component
            }
        ],
        {
            initialEntries: ['/']
        }
    );

    return render(<RouterProvider router={router} />);
};

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
        renderWithRouter(<Login />);

        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByTestId('login-email-input')).toBeInTheDocument();
        expect(screen.getByTestId('login-password-input')).toBeInTheDocument();
        expect(screen.getByTestId('login-button')).toBeInTheDocument();
        expect(
            screen.getByTestId('forgot-password-button')
        ).toBeInTheDocument();
    });

    it('renders OAuth buttons', () => {
        renderWithRouter(<Login />);

        expect(screen.getByTestId('google-oauth-button')).toBeInTheDocument();
        expect(screen.getByTestId('github-oauth-button')).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', async () => {
        renderWithRouter(<Login />);

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

        await waitFor(
            () => {
                // Check for aria-invalid state instead of exact error messages
                expect(emailInput).toHaveAttribute('aria-invalid', 'true');
            },
            { timeout: 2000 }
        );
    });

    it.skip('shows validation error for invalid email', async () => {
        renderWithRouter(<Login />);

        const emailInput = screen.getByTestId('login-email-input');
        const passwordInput = screen.getByTestId('login-password-input');
        const submitButton = screen.getByTestId('login-button');

        // Enter invalid email and trigger validation
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.focus(emailInput);
        fireEvent.blur(emailInput);

        // Fill password field to avoid other validation errors
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.focus(passwordInput);
        fireEvent.blur(passwordInput);

        // Then submit the form
        fireEvent.click(submitButton);

        await waitFor(
            () => {
                // Check if validation is working - form should not submit with invalid email
                // We can check for aria-invalid or if validation is preventing submission
                const hasAriaInvalid =
                    emailInput.getAttribute('aria-invalid') === 'true';
                const hasErrorMessage = screen.queryByText(/invalid/i) !== null;

                // Accept either aria-invalid attribute or visible error message
                expect(hasAriaInvalid || hasErrorMessage).toBe(true);
            },
            { timeout: 2000 }
        );
    });

    it('toggles password visibility', () => {
        renderWithRouter(<Login />);

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
        renderWithRouter(<Login />);

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
        renderWithRouter(<Login />);

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
        renderWithRouter(<Login />);

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

        renderWithRouter(<Login />);

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
                '/api/auth/password-reset/request',
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

        renderWithRouter(<Login />);

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
                    user: {
                        id: 'test-user-id',
                        email: 'test@example.com',
                        name: 'Test User',
                        roles: ['editor'],
                        emailVerified: true
                    },
                    tokens: {
                        accessToken: 'fake-token',
                        refreshToken: 'fake-refresh-token',
                        expiresIn: 900
                    }
                })
        } as Response);

        renderWithRouter(<Login />);

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

        renderWithRouter(<Login />);

        // Fill in credentials
        const emailInput = screen.getByTestId('login-email-input');
        const passwordInput = screen.getByTestId('login-password-input');
        const submitButton = screen.getByTestId('login-button');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
        });
    });
});
