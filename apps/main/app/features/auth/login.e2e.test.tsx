/**
 * E2E Tests for Login Page
 * These tests run in a real browser using Vitest browser mode
 *
 * NOTE: These tests require the application server to be running
 * Start the dev server with: pnpm dev
 * Then run: pnpm test:e2e
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { page, userEvent } from '@vitest/browser/context';

const APP_URL = 'http://localhost:3000';

// Helper to wait for async operations
const wait = (ms: number) =>
    new Promise(resolve => {
        setTimeout(resolve, ms);
    });

describe('Login Page E2E', () => {
    beforeEach(async () => {
        // Navigate by setting window.location directly
        const targetUrl = `${APP_URL}/auth/login`;
        window.location.href = targetUrl;

        // Wait for navigation to complete
        await wait(1000);
    });

    it('renders login form with all fields', async () => {
        // Check for main heading
        const heading = page.getByText('Welcome Back');
        await expect.element(heading).toBeInTheDocument();

        // Check form fields exist
        const emailInput = page.getByTestId('login-email-input');
        const passwordInput = page.getByTestId('login-password-input');
        const submitButton = page.getByTestId('login-button');

        await expect.element(emailInput).toBeInTheDocument();
        await expect.element(passwordInput).toBeInTheDocument();
        await expect.element(submitButton).toBeInTheDocument();
    });

    it('renders OAuth buttons', async () => {
        const googleButton = page.getByTestId('google-oauth-button');
        const githubButton = page.getByTestId('github-oauth-button');

        await expect.element(googleButton).toBeInTheDocument();
        await expect.element(githubButton).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', async () => {
        // Click submit without filling fields
        const submitButton = page.getByTestId('login-button');
        await userEvent.click(submitButton);

        // Wait a bit for validation
        await wait(500);

        // Check for validation errors
        const errors = page.getByRole('alert');
        await expect.element(errors).toBeInTheDocument();
    });

    it('toggles password visibility', async () => {
        const passwordInput = page.getByTestId('login-password-input');
        const toggleButton = page.getByTestId(
            'toggle-login-password-visibility'
        );

        // Password should be hidden initially
        await expect.element(passwordInput).toHaveAttribute('type', 'password');

        // Click toggle
        await userEvent.click(toggleButton);

        // Wait for state change
        await wait(200);

        // Password should be visible
        await expect.element(passwordInput).toHaveAttribute('type', 'text');

        // Click toggle again
        await userEvent.click(toggleButton);

        // Wait for state change
        await wait(200);

        // Password should be hidden again
        await expect.element(passwordInput).toHaveAttribute('type', 'password');
    });

    it('navigates to forgot password form', async () => {
        const forgotPasswordButton = page.getByTestId('forgot-password-button');
        await userEvent.click(forgotPasswordButton);

        // Wait for navigation/state change
        await wait(500);

        // Should show forgot password form
        const heading = page.getByText('Reset Your Password');
        await expect.element(heading).toBeInTheDocument();
    });

    it('returns to login form from forgot password', async () => {
        // Go to forgot password
        const forgotPasswordButton = page.getByTestId('forgot-password-button');
        await userEvent.click(forgotPasswordButton);

        // Wait for state change
        await wait(500);

        // Click back button
        const backButton = page.getByText('Back to Login');
        await userEvent.click(backButton);

        // Wait for state change
        await wait(500);

        // Should be back on login form
        const heading = page.getByText('Welcome Back');
        await expect.element(heading).toBeInTheDocument();
    });
});
