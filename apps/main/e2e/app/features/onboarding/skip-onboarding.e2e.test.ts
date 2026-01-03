import { test, expect } from '@playwright/test';

test.describe('Skipping Onboarding', () => {
    // Error: "context" and "page" fixtures are not supported in "beforeAll" since they are created on a per-test basis.
    // If you would like to reuse a single page between tests, create context manually with browser.newContext(). See https://aka.ms/playwright/reuse-page for details.
    // If you would like to configure your page before each test, do that in beforeEach hook instead.
    //
    // test.beforeAll(async ({ page }) => {
    //     // Ensure starting from a clean state
    //     await page.goto('/');
    // });

    test('should allow user to skip onboarding', async ({ page }) => {
        await page.goto('/auth/login?redirectTo=/onboarding');

        await page.getByTestId('login-email-input').click();
        await page.getByTestId('login-email-input').fill('admin@example.com');
        await page.getByTestId('login-password-input').click();
        await page.getByTestId('login-password-input').fill('admin123');
        await page.getByTestId('login-button').click();

        await page.getByRole('button', { name: 'Skip Setup' }).click();

        expect(page.url()).not.toBe('http://localhost:3007/onboarding');
    });
});
