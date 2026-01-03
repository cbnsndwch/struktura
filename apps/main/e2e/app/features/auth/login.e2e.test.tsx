/**
 * E2E Tests for Login Feature
 * Covers UI components, interactions, validation, and authentication workflows.
 *
 * PREREQUISITES:
 * 1. MongoDB must be running
 * 2. Database must be seeded with test users: pnpm db:seed
 * 3. Dev server must be running: pnpm dev
 */
import { test, expect, Page } from '@playwright/test';

import { BASE_URL } from '../../../fixtures/shared.fixtures.js';
import { TEST_USERS } from '../../../fixtures/auth.fixtures.js';
import { wait } from '../../../utils/wait.js';

/**
 * Clear session cookies to ensure fresh login state
 */
async function clearSession(page: Page) {
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();

        // @ts-expect-error - document is available in browser context
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const eqPos = cookie.indexOf('=');
            const name =
                eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
            // @ts-expect-error - document is available in browser context
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
    });
}

/**
 * Navigate to login page and wait for it to load
 */
async function navigateToLogin(page: Page) {
    await page.goto(`${BASE_URL}/auth/login`);

    const heading = page.getByText('Welcome Back');
    const headingExpectation = expect(heading);

    await headingExpectation.toBeAttached();
}

/**
 * Fill login form and submit
 */
async function submitLogin(page: Page, email: string, password: string) {
    const emailInput = page.getByTestId('login-email-input');
    const passwordInput = page.getByTestId('login-password-input');
    const submitButton = page.getByTestId('login-button');

    await emailInput.clear();
    await emailInput.fill(email);
    await wait(200);

    await passwordInput.clear();
    await passwordInput.fill(password);
    await wait(200);

    await submitButton.click();
}

test.describe('Login E2E', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to domain first to allow clearing session
        await page.goto(BASE_URL);
        await clearSession(page);
        await navigateToLogin(page);
    });

    /*

    test.describe('UI Components & Interactions', () => {
        test('renders login form with all fields', async ({page}) => {
            const emailInput = page.getByTestId('login-email-input');
            const passwordInput = page.getByTestId('login-password-input');
            const submitButton = page.getByTestId('login-button');

            await expect(emailInput).toBeAttached();
            await expect(passwordInput).toBeAttached();
            await expect(submitButton).toBeAttached();
        });

        test('renders OAuth buttons', async ({page}) => {
            const googleButton = page.getByTestId('google-oauth-button');
            const githubButton = page.getByTestId('github-oauth-button');

            await expect(googleButton).toBeAttached();
            await expect(githubButton).toBeAttached();
        });

        test('toggles password visibility', async ({page}) => {
            const passwordInput = page.getByTestId('login-password-input');
            const toggleButton = page.getByTestId(
                'toggle-login-password-visibility'
            );

            await expect
                .element(passwordInput)
                .toHaveAttribute('type', 'password');
            await userEvent.click(toggleButton);
            await wait(200);
            await expect(passwordInput).toHaveAttribute('type', 'text');
            await userEvent.click(toggleButton);
            await wait(200);
            await expect
                .element(passwordInput)
                .toHaveAttribute('type', 'password');
        });

        test('navigates to forgot password form and back', async ({page}) => {
            const forgotPasswordButton = page.getByTestId(
                'forgot-password-button'
            );
            await userEvent.click(forgotPasswordButton);
            await wait(500);

            const heading = page.getByText('Reset Your Password');
            await expect(heading).toBeAttached();

            const backButton = page.getByText('Back to Login');
            await userEvent.click(backButton);
            await wait(500);

            const loginHeading = page.getByText('Welcome Back');
            await expect(loginHeading).toBeAttached();
        });
    });

    test.describe('Form Validation', () => {
        test('should show validation error for empty email', async ({page}) => {
            const passwordInput = page.getByTestId('login-password-input');
            const submitButton = page.getByTestId('login-button');

            await userEvent.fill(passwordInput, 'password123');
            await wait(200);
            await userEvent.click(submitButton);
            await wait(500);

            const alerts = page.getByRole('alert');
            await expect(alerts).toBeAttached();
        });

        test('should show validation error for empty password', async ({page}) => {
            const emailInput = page.getByTestId('login-email-input');
            const submitButton = page.getByTestId('login-button');

            await userEvent.fill(emailInput, 'test@example.com');
            await wait(200);
            await userEvent.click(submitButton);
            await wait(500);

            const alerts = page.getByRole('alert');
            await expect(alerts).toBeAttached();
        });

        test('should show validation error for invalid email format', async ({page}) => {
            const emailInput = page.getByTestId('login-email-input');
            const passwordInput = page.getByTestId('login-password-input');
            const submitButton = page.getByTestId('login-button');

            await userEvent.fill(emailInput, 'invalid-email');
            await wait(200);
            await userEvent.fill(passwordInput, 'password123');
            await wait(200);
            await userEvent.click(submitButton);
            await wait(500);

            const alerts = page.getByRole('alert');
            await expect(alerts).toBeAttached();
        });
    });

    */

    test.describe('Authentication Workflows', () => {
        test.describe('Successful Login', () => {
            test('should login successfully with test@example.com (editor)', async ({
                page
            }) => {
                const user = TEST_USERS[0]!;
                await submitLogin(page, user.email, user.password);
                await wait(2000);
                const currentUrl = page.url();
                expect(currentUrl).not.toContain('/auth/login');
                expect(
                    currentUrl.includes('/dashboard') ||
                        currentUrl.includes('/workspaces')
                ).toBe(true);
            });

            test('should login successfully with admin@example.com (admin)', async ({
                page
            }) => {
                const user = TEST_USERS[1]!;
                await submitLogin(page, user.email, user.password);
                await wait(2000);
                const currentUrl = page.url();
                expect(currentUrl).not.toContain('/auth/login');
            });

            test('should login successfully with viewer@example.com (viewer)', async ({
                page
            }) => {
                const user = TEST_USERS[2]!;
                await submitLogin(page, user.email, user.password);
                await wait(2000);
                const currentUrl = page.url();
                expect(currentUrl).not.toContain('/auth/login');
            });
        });

        test.describe('Failed Login', () => {
            test('should show error for invalid password', async ({ page }) => {
                await submitLogin(page, 'test@example.com', 'wrong-password');
                await wait(2000);

                const currentUrl = page.url();
                expect(currentUrl).toContain('/auth/login');

                const alerts = page.getByRole('alert');
                const alertsExpectation = expect(alerts);

                await alertsExpectation.toBeAttached();
            });

            test('should show error for non-existent user', async ({
                page
            }) => {
                await submitLogin(
                    page,
                    'nonexistent@example.com',
                    'password123'
                );
                await wait(2000);
                const currentUrl = page.url();
                expect(currentUrl).toContain('/auth/login');
                const alerts = page.getByRole('alert');
                await expect(alerts).toBeAttached();
            });
        });

        test.describe('Session Management', () => {
            test('should maintain separate sessions between different users', async ({
                page
            }) => {
                const user1 = TEST_USERS[0]!;
                await submitLogin(page, user1.email, user1.password);
                await wait(2000);
                expect(page.url()).not.toContain('/auth/login');

                await clearSession(page);
                await navigateToLogin(page);

                const user2 = TEST_USERS[1]!;
                await submitLogin(page, user2.email, user2.password);
                await wait(2000);
                expect(page.url()).not.toContain('/auth/login');
            });

            test('should maintain session after page refresh', async ({
                page
            }) => {
                const user = TEST_USERS[0]!;
                await submitLogin(page, user.email, user.password);
                await wait(2000);
                expect(page.url()).not.toContain('/auth/login');

                await page.reload();
                await wait(2000);
                expect(page.url()).not.toContain('/auth/login');
            });
        });
    });
});
