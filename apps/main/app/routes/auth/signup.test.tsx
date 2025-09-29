import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Signup from './signup';

// Mock fetch globally
global.fetch = vi.fn();

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
        render(<Signup />);
        
        expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
        expect(screen.getByTestId('email-input')).toBeInTheDocument();
        expect(screen.getByTestId('name-input')).toBeInTheDocument();
        expect(screen.getByTestId('password-input')).toBeInTheDocument();
        expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument();
        expect(screen.getByTestId('accept-terms-checkbox')).toBeInTheDocument();
        expect(screen.getByTestId('signup-button')).toBeInTheDocument();
    });

    it('renders OAuth buttons', () => {
        render(<Signup />);
        
        expect(screen.getByTestId('google-oauth-button')).toBeInTheDocument();
        expect(screen.getByTestId('github-oauth-button')).toBeInTheDocument();
    });

    it('shows password strength indicator when password is entered', async () => {
        render(<Signup />);
        
        const passwordInput = screen.getByTestId('password-input');
        fireEvent.change(passwordInput, { target: { value: 'Test123' } });

        await waitFor(() => {
            expect(screen.getByText('Password strength')).toBeInTheDocument();
            expect(screen.getByText('Medium')).toBeInTheDocument();
            expect(screen.getByTestId('password-strength-progress')).toBeInTheDocument();
        });
    });

    it('shows validation errors for empty fields', async () => {
        render(<Signup />);
        
        const submitButton = screen.getByTestId('signup-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Email is required')).toBeInTheDocument();
            expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
            expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
        });
    });

    it('shows error when passwords do not match', async () => {
        render(<Signup />);
        
        const passwordInput = screen.getByTestId('password-input');
        const confirmPasswordInput = screen.getByTestId('confirm-password-input');
        const submitButton = screen.getByTestId('signup-button');
        
        fireEvent.change(passwordInput, { target: { value: 'Test123456' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'Different123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
        });
    });

    it('shows error when terms are not accepted', async () => {
        render(<Signup />);
        
        const emailInput = screen.getByTestId('email-input');
        const nameInput = screen.getByTestId('name-input');
        const passwordInput = screen.getByTestId('password-input');
        const confirmPasswordInput = screen.getByTestId('confirm-password-input');
        const submitButton = screen.getByTestId('signup-button');
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(passwordInput, { target: { value: 'Test123456' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'Test123456' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('You must accept the terms of service and privacy policy')).toBeInTheDocument();
        });
    });

    it('toggles password visibility', () => {
        render(<Signup />);
        
        const passwordInput = screen.getByTestId('password-input');
        const toggleButton = screen.getByTestId('toggle-password-visibility');
        
        expect(passwordInput).toHaveAttribute('type', 'password');
        
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');
        
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
    });
});