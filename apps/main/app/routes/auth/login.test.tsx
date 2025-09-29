import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from './login';

// Mock fetch globally
global.fetch = vi.fn();

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('alert', vi.fn());
        Object.defineProperty(window, 'location', {
            value: {
                href: '',
                search: ''
            },
            writable: true
        });
    });

    it('renders login form with all fields', () => {
        render(<Login />);
        
        expect(screen.getByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
        expect(screen.getByTestId('login-email-input')).toBeInTheDocument();
        expect(screen.getByTestId('login-password-input')).toBeInTheDocument();
        expect(screen.getByTestId('login-button')).toBeInTheDocument();
        expect(screen.getByTestId('forgot-password-button')).toBeInTheDocument();
    });

    it('renders OAuth buttons', () => {
        render(<Login />);
        
        expect(screen.getByTestId('google-oauth-button')).toBeInTheDocument();
        expect(screen.getByTestId('github-oauth-button')).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', async () => {
        render(<Login />);
        
        const submitButton = screen.getByTestId('login-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Email is required')).toBeInTheDocument();
            expect(screen.getByText('Password is required')).toBeInTheDocument();
        });
    });

    it('shows validation error for invalid email', async () => {
        render(<Login />);
        
        const emailInput = screen.getByTestId('login-email-input');
        const submitButton = screen.getByTestId('login-button');
        
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
        });
    });

    it('toggles password visibility', () => {
        render(<Login />);
        
        const passwordInput = screen.getByTestId('login-password-input');
        const toggleButton = screen.getByTestId('toggle-login-password-visibility');
        
        expect(passwordInput).toHaveAttribute('type', 'password');
        
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');
        
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
    });
});