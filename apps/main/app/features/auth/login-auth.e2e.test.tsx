/**
 * E2E Tests for Login Authentication Workflows
 * 
 * These tests verify actual login functionality with seeded test users.
 * 
 * PREREQUISITES:
 * 1. MongoDB must be running (default: mongodb://[::1]:27017/struktura-dev)
 * 2. Database must be seeded with test users: pnpm db:seed
 * 3. Dev server must be running: pnpm dev (in apps/main)
 * 
 * Test Users (from scripts/seed-test-users.ts):
 * - test@example.com / password123 (editor role)
 * - admin@example.com / admin123 (admin role)
 * - viewer@example.com / viewer123 (viewer role)
 * 
 * Run with: pnpm test:e2e
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { page, userEvent } from '@vitest/browser/context';

const APP_URL = 'http://localhost:3000';

// Helper to wait for async operations
const wait = (ms: number) =>
    new Promise(resolve => {
        setTimeout(resolve, ms);
    });

// Test users from seed script
const TEST_USERS = [
    {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'editor'
    },
    {
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin'
    },
    {
        email: 'viewer@example.com',
        password: 'viewer123',
        name: 'Viewer User',
        role: 'viewer'
    }
];

/**
 * Clear session cookies to ensure fresh login state
 * This simulates a fresh browser session
 */
async function clearSession() {
    // Clear localStorage and sessionStorage
    if (typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();
    }
    
    // Clear cookies by setting them to expire
    // Note: Vitest browser mode doesn't provide direct cookie clearing API
    // We clear storage and navigate to a clean state instead
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
}

/**
 * Navigate to login page and wait for it to load
 */
async function navigateToLogin() {
    window.location.href = `${APP_URL}/auth/login`;
    await wait(1000);
    
    // Verify we're on the login page
    const heading = page.getByText('Welcome Back');
    await expect.element(heading).toBeInTheDocument();
}

/**
 * Fill login form and submit
 */
async function submitLogin(email: string, password: string) {
    const emailInput = page.getByTestId('login-email-input');
    const passwordInput = page.getByTestId('login-password-input');
    const submitButton = page.getByTestId('login-button');
    
    // Fill form
    await userEvent.clear(emailInput);
    await userEvent.fill(emailInput, email);
    await wait(200);
    
    await userEvent.clear(passwordInput);
    await userEvent.fill(passwordInput, password);
    await wait(200);
    
    // Submit
    await userEvent.click(submitButton);
}

/**
 * Wait for navigation away from login page (indicates successful login)
 */
async function waitForLoginSuccess(timeout = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
        const currentUrl = window.location.href;
        if (!currentUrl.includes('/auth/login')) {
            return true;
        }
        await wait(200);
    }
    
    throw new Error('Login did not complete within timeout');
}

describe('Login Authentication E2E', () => {
    beforeEach(async () => {
        // Clear session before each test to ensure fresh state
        await clearSession();
        await navigateToLogin();
    });
    
    describe('Successful Login Scenarios', () => {
        it('should login successfully with test@example.com (editor)', async () => {
            const user = TEST_USERS[0]; // editor
            
            await submitLogin(user.email, user.password);
            
            // Wait for redirect (indicates successful login)
            await wait(2000);
            
            // Verify we're no longer on login page
            const currentUrl = window.location.href;
            expect(currentUrl).not.toContain('/auth/login');
            
            // Verify we're redirected to dashboard or workspaces
            expect(
                currentUrl.includes('/dashboard') || 
                currentUrl.includes('/workspaces')
            ).toBe(true);
        });
        
        it('should login successfully with admin@example.com (admin)', async () => {
            const user = TEST_USERS[1]; // admin
            
            await submitLogin(user.email, user.password);
            
            // Wait for redirect
            await wait(2000);
            
            // Verify successful login
            const currentUrl = window.location.href;
            expect(currentUrl).not.toContain('/auth/login');
            expect(
                currentUrl.includes('/dashboard') || 
                currentUrl.includes('/workspaces')
            ).toBe(true);
        });
        
        it('should login successfully with viewer@example.com (viewer)', async () => {
            const user = TEST_USERS[2]; // viewer
            
            await submitLogin(user.email, user.password);
            
            // Wait for redirect
            await wait(2000);
            
            // Verify successful login
            const currentUrl = window.location.href;
            expect(currentUrl).not.toContain('/auth/login');
            expect(
                currentUrl.includes('/dashboard') || 
                currentUrl.includes('/workspaces')
            ).toBe(true);
        });
    });
    
    describe('Failed Login Scenarios', () => {
        it('should show error for invalid password', async () => {
            await submitLogin('test@example.com', 'wrongpassword');
            
            // Wait for error message
            await wait(2000);
            
            // Verify we're still on login page
            const currentUrl = window.location.href;
            expect(currentUrl).toContain('/auth/login');
            
            // Check for error alert
            const alerts = page.getByRole('alert');
            await expect.element(alerts).toBeInTheDocument();
        });
        
        it('should show error for non-existent user', async () => {
            await submitLogin('nonexistent@example.com', 'password123');
            
            // Wait for error message
            await wait(2000);
            
            // Verify we're still on login page
            const currentUrl = window.location.href;
            expect(currentUrl).toContain('/auth/login');
            
            // Check for error alert
            const alerts = page.getByRole('alert');
            await expect.element(alerts).toBeInTheDocument();
        });
    });
    
    describe('Session Isolation', () => {
        it('should maintain separate sessions between different users', async () => {
            // Login with first user
            const user1 = TEST_USERS[0];
            await submitLogin(user1.email, user1.password);
            await wait(2000);
            
            // Verify logged in
            let currentUrl = window.location.href;
            expect(currentUrl).not.toContain('/auth/login');
            
            // Logout and clear session
            await clearSession();
            await navigateToLogin();
            
            // Login with second user
            const user2 = TEST_USERS[1];
            await submitLogin(user2.email, user2.password);
            await wait(2000);
            
            // Verify logged in as different user
            currentUrl = window.location.href;
            expect(currentUrl).not.toContain('/auth/login');
        });
    });
    
    describe('Session Persistence', () => {
        it('should maintain session after page refresh', async () => {
            const user = TEST_USERS[0];
            
            // Login
            await submitLogin(user.email, user.password);
            await wait(2000);
            
            // Get logged-in URL
            const loggedInUrl = window.location.href;
            expect(loggedInUrl).not.toContain('/auth/login');
            
            // Refresh page
            window.location.reload();
            await wait(2000);
            
            // Verify still logged in (not redirected to login)
            const currentUrl = window.location.href;
            expect(currentUrl).not.toContain('/auth/login');
        });
    });
});

describe('Login Form Validation', () => {
    beforeEach(async () => {
        await clearSession();
        await navigateToLogin();
    });
    
    it('should show validation error for empty email', async () => {
        const passwordInput = page.getByTestId('login-password-input');
        const submitButton = page.getByTestId('login-button');
        
        // Only fill password
        await userEvent.fill(passwordInput, 'password123');
        await wait(200);
        
        // Submit form
        await userEvent.click(submitButton);
        await wait(500);
        
        // Check for validation error
        const alerts = page.getByRole('alert');
        await expect.element(alerts).toBeInTheDocument();
    });
    
    it('should show validation error for empty password', async () => {
        const emailInput = page.getByTestId('login-email-input');
        const submitButton = page.getByTestId('login-button');
        
        // Only fill email
        await userEvent.fill(emailInput, 'test@example.com');
        await wait(200);
        
        // Submit form
        await userEvent.click(submitButton);
        await wait(500);
        
        // Check for validation error
        const alerts = page.getByRole('alert');
        await expect.element(alerts).toBeInTheDocument();
    });
    
    it('should show validation error for invalid email format', async () => {
        const emailInput = page.getByTestId('login-email-input');
        const passwordInput = page.getByTestId('login-password-input');
        const submitButton = page.getByTestId('login-button');
        
        // Fill with invalid email
        await userEvent.fill(emailInput, 'invalid-email');
        await wait(200);
        await userEvent.fill(passwordInput, 'password123');
        await wait(200);
        
        // Submit form
        await userEvent.click(submitButton);
        await wait(500);
        
        // Check for validation error
        const alerts = page.getByRole('alert');
        await expect.element(alerts).toBeInTheDocument();
    });
});
