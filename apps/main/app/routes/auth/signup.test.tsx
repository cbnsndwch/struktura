import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import Signup from './signup.js';

// Mock fetch globally
global.fetch = vi.fn();

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

describe('Signup Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('alert', vi.fn());
        Object.defineProperty(window, 'location', {
            value: {
                href: ''
            },
            writable: true
        });
    });

    it('renders signup form with all fields', () => {
        renderWithRouter(<Signup />);

        expect(
            screen.getByText('Start your free Struktura account')
        ).toBeInTheDocument();
        expect(screen.getByTestId('email-input')).toBeInTheDocument();
        expect(screen.getByTestId('name-input')).toBeInTheDocument();
        expect(screen.getByTestId('password-input')).toBeInTheDocument();
        expect(
            screen.getByTestId('confirm-password-input')
        ).toBeInTheDocument();
        expect(screen.getByTestId('accept-terms-checkbox')).toBeInTheDocument();
        expect(screen.getByTestId('signup-button')).toBeInTheDocument();
    });

    it('renders OAuth buttons', () => {
        renderWithRouter(<Signup />);

        expect(screen.getByTestId('google-oauth-button')).toBeInTheDocument();
        expect(screen.getByTestId('github-oauth-button')).toBeInTheDocument();
    });

    it('shows password strength indicator when password is entered', async () => {
        renderWithRouter(<Signup />);

        const passwordInput = screen.getByTestId('password-input');
        fireEvent.change(passwordInput, { target: { value: 'Test123' } });

        await waitFor(() => {
            expect(screen.getByText('Password strength')).toBeInTheDocument();
            expect(screen.getByText('Medium')).toBeInTheDocument();
            expect(
                screen.getByTestId('password-strength-progress')
            ).toBeInTheDocument();
        });
    });

    it('shows validation errors for empty fields', async () => {
        renderWithRouter(<Signup />);

        const emailInput = screen.getByTestId('email-input');
        const nameInput = screen.getByTestId('name-input');
        const passwordInput = screen.getByTestId('password-input');
        const submitButton = screen.getByTestId('signup-button');

        // Try to trigger validation by focusing and blurring fields
        fireEvent.focus(emailInput);
        fireEvent.blur(emailInput);
        fireEvent.focus(nameInput);
        fireEvent.blur(nameInput);
        fireEvent.focus(passwordInput);
        fireEvent.blur(passwordInput);

        // Then submit the form
        fireEvent.click(submitButton);

        // Check if the submit button is still enabled (form didn't submit due to validation)
        // or look for generic validation indicators
        await waitFor(
            () => {
                // Since the exact error messages might not be visible,
                // let's check that the form fields have invalid states
                expect(emailInput).toHaveAttribute('aria-invalid', 'true');
            },
            { timeout: 2000 }
        );
    });

    it('shows error when passwords do not match', async () => {
        renderWithRouter(<Signup />);

        const passwordInput = screen.getByTestId('password-input');
        const confirmPasswordInput = screen.getByTestId(
            'confirm-password-input'
        );
        const submitButton = screen.getByTestId('signup-button');

        fireEvent.change(passwordInput, { target: { value: 'Test123456' } });
        fireEvent.change(confirmPasswordInput, {
            target: { value: 'Different123' }
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(
                screen.getByText('Passwords do not match')
            ).toBeInTheDocument();
        });
    });

    it('shows error when terms are not accepted', async () => {
        renderWithRouter(<Signup />);

        const emailInput = screen.getByTestId('email-input');
        const nameInput = screen.getByTestId('name-input');
        const passwordInput = screen.getByTestId('password-input');
        const confirmPasswordInput = screen.getByTestId(
            'confirm-password-input'
        );
        const submitButton = screen.getByTestId('signup-button');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(passwordInput, { target: { value: 'Test123456' } });
        fireEvent.change(confirmPasswordInput, {
            target: { value: 'Test123456' }
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(
                screen.getByText(
                    'You must accept the terms of service and privacy policy'
                )
            ).toBeInTheDocument();
        });
    });

    it('toggles password visibility', () => {
        renderWithRouter(<Signup />);

        const passwordInput = screen.getByTestId('password-input');
        const toggleButton = screen.getByTestId('toggle-password-visibility');

        expect(passwordInput).toHaveAttribute('type', 'password');

        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');

        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
    });
});
