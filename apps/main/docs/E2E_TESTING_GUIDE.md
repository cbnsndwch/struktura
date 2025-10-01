# E2E Testing with Vitest Browser Mode

## Overview

This document explains how to write end-to-end (E2E) tests using Vitest's browser mode. These tests run in a real browser (Chromium via Playwright) and test the actual user experience without mocking.

## Why E2E Tests?

The component tests were failing because they had a fundamental mismatch:
- **Components** use `useLoaderData()` expecting React Router loaders
- **Tests** rendered components directly without proper routing

**E2E tests solve this** by:
✅ Testing the actual running application  
✅ No mocking required - real routes, real loaders  
✅ Tests what users actually see and experience  
✅ Catches integration issues between frontend and backend  

## Setup

### Dependencies

```bash
pnpm add -D @vitest/browser playwright
```

### Configuration

**`vitest.browser.config.ts`** - Browser mode configuration:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        browser: {
            enabled: true,
            name: 'chromium',
            provider: 'playwright',
            headless: true
        },
        include: ['**/*.e2e.test.{ts,tsx}'],
        testTimeout: 30000
    }
});
```

### Running E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Watch mode (auto-run on changes)
pnpm test:e2e:watch

# UI mode (visual test runner)
pnpm test:e2e:ui
```

**⚠️ IMPORTANT**: E2E tests require the application server to be running:

```bash
# Terminal 1: Start the app
pnpm dev

# Terminal 2: Run E2E tests
pnpm test:e2e
```

## Vitest Browser Mode API Reference

Vitest browser mode provides a different API than Playwright, even though it uses Playwright as the provider. Here are the key differences:

### Navigation

```typescript
// ❌ NOT available: page.goto()
// ✅ Use: Direct window.location manipulation
beforeEach(async () => {
    window.location.href = 'http://localhost:3000/auth/login';
    await wait(1000); // Wait for navigation
});

// Helper function for waiting
const wait = (ms: number) =>
    new Promise(resolve => {
        setTimeout(resolve, ms);
    });
```

### Finding Elements

```typescript
// ✅ Available: page.getBy* methods
page.getByRole('button', { name: /submit/i })
page.getByText(/welcome/i)
page.getByTestId('login-button')
page.getByLabel(/email/i)
page.getByPlaceholder(/enter email/i)
```

### User Interactions

```typescript
// ✅ Use: userEvent from @vitest/browser/context
import { userEvent } from '@vitest/browser/context';

await userEvent.click(button);
await userEvent.fill(input, 'text');
await userEvent.type(input, 'text');
await userEvent.clear(input);
```

### Waiting for Changes

```typescript
// ❌ NOT available: page.waitForTimeout(), page.waitForURL()
// ✅ Use: Simple Promise with setTimeout
const wait = (ms: number) =>
    new Promise(resolve => {
        setTimeout(resolve, ms);
    });

await wait(500); // Wait 500ms
```

### Assertions

```typescript
// ✅ Use: expect.element()
await expect.element(heading).toBeInTheDocument();
await expect.element(button).toBeVisible();
await expect.element(input).toHaveAttribute('type', 'password');
```

## Writing E2E Tests

### Basic Pattern

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { page } from '@vitest/browser/context';

const APP_URL = 'http://localhost:3000';

describe('Feature Name E2E', () => {
    beforeEach(async () => {
        // Navigate to the page before each test
        await page.goto(`${APP_URL}/feature-path`);
    });

    it('renders the page', async () => {
        // Find elements
        const heading = page.getByRole('heading', { name: /welcome/i });
        
        // Assert they exist in DOM
        await expect.element(heading).toBeInTheDocument();
    });

    it('user interaction works', async () => {
        // Get elements
        const button = page.getByRole('button', { name: /submit/i });
        const input = page.getByLabelText(/email/i);

        // Interact
        await input.fill('user@example.com');
        await button.click();

        // Assert result
        const success = page.getByText(/success/i);
        await expect.element(success).toBeInTheDocument();
    });
});
```

### Finding Elements

Vitest browser mode provides Playwright-like selectors:

```typescript
// By role (BEST - accessible)
page.getByRole('button', { name: /submit/i })
page.getByRole('heading', { name: /welcome/i })
page.getByRole('textbox', { name: /email/i })

// By label text
page.getByLabel(/email/i)
page.getByLabel('Password')

// By text content
page.getByText(/welcome back/i)
page.getByText('Login')

// By test ID
page.getByTestId('submit-button')

// By placeholder
page.getByPlaceholder(/enter your email/i)
```

### User Interactions

```typescript
// Click
await button.click();

// Type text
await input.fill('text to type');

// Check checkbox
await checkbox.check();

// Uncheck
await checkbox.uncheck();

// Select option
await select.selectOption('option-value');

// Hover
await element.hover();
```

### Assertions

```typescript
// Element exists in DOM
await expect.element(heading).toBeInTheDocument();

// Element is visible
await expect.element(button).toBeVisible();

// Element has text
await expect.element(message).toHaveText(/success/i);

// Element has attribute
await expect.element(input).toHaveAttribute('type', 'password');

// Element has class
await expect.element(div).toHaveClass('active');

// Element is enabled/disabled
await expect.element(button).toBeEnabled();
await expect.element(button).toBeDisabled();

// Element is checked
await expect.element(checkbox).toBeChecked();
```

### Waiting for Changes

```typescript
// Wait for element to appear
await expect.element(popup).toBeInTheDocument({ timeout: 5000 });

// Wait for element to disappear
await expect.element(loading).not.toBeInTheDocument();

// Wait for URL change
// Note: Use page.url() and poll manually or use network idle

// Wait for condition
await expect.poll(() => page.url()).toContain('/dashboard');
```

## Best Practices

### 1. Use Semantic Queries

Prefer queries that resemble how users find elements:

```typescript
// ✅ Good - accessible queries
page.getByRole('button', { name: /submit/i })
page.getByLabel(/email/i)
page.getByText(/welcome/i)

// ❌ Avoid - implementation details
page.locator('.btn-submit')
page.locator('#email-input')
```

### 2. Test User Flows, Not Implementation

```typescript
// ✅ Good - tests what user does
it('user can log in', async () => {
    await page.getByLabel(/email/i).fill('user@example.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /log in/i }).click();
    
    await expect.element(page.getByText(/welcome/i)).toBeInTheDocument();
});

// ❌ Bad - tests implementation
it('calls login API', async () => {
    // Don't test internal API calls in E2E tests
});
```

### 3. Keep Tests Independent

Each test should:
- Start from a clean state
- Not depend on other tests
- Clean up after itself if needed

```typescript
beforeEach(async () => {
    // Reset to known state
    await page.goto(`${APP_URL}/login`);
    
    // Clear localStorage/sessionStorage if needed
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
});
```

### 4. Handle Async Properly

Always `await` async operations:

```typescript
// ✅ Good
await button.click();
await expect.element(message).toBeInTheDocument();

// ❌ Bad - missing await
button.click(); // Won't work!
expect.element(message).toBeInTheDocument(); // Will fail!
```

## Common Patterns

### Testing Forms

```typescript
it('submits form with validation', async () => {
    // Leave required field empty
    await page.getByLabel(/email/i).fill('');
    await page.getByRole('button', { name: /submit/i }).click();
    
    // Check for error
    const error = page.getByText(/email is required/i);
    await expect.element(error).toBeInTheDocument();
    
    // Fill correctly
    await page.getByLabel(/email/i).fill('valid@email.com');
    await page.getByRole('button', { name: /submit/i }).click();
    
    // Check success
    const success = page.getByText(/success/i);
    await expect.element(success).toBeInTheDocument();
});
```

### Testing Navigation

```typescript
it('navigates between pages', async () => {
    // Click link
    const link = page.getByRole('link', { name: /dashboard/i });
    await link.click();
    
    // Check new page loaded
    await expect.poll(() => page.url()).toContain('/dashboard');
    
    const heading = page.getByRole('heading', { name: /dashboard/i });
    await expect.element(heading).toBeInTheDocument();
});
```

### Testing Lists

```typescript
it('displays list of items', async () => {
    // Get all list items
    const items = page.getByRole('listitem');
    
    // Check count
    await expect.element(items).toHaveCount(3);
    
    // Check specific item
    const firstItem = page.getByText(/first item/i);
    await expect.element(firstItem).toBeInTheDocument();
});
```

## Debugging E2E Tests

### Run in Non-Headless Mode

Update `vitest.browser.config.ts`:

```typescript
browser: {
    enabled: true,
    name: 'chromium',
    provider: 'playwright',
    headless: false, // See the browser!
}
```

### Use Screenshots

```typescript
it('test name', async () => {
    // Take screenshot
    await page.screenshot({ path: 'screenshot.png' });
    
    // Or use in error handler
    try {
        // test code
    } catch (error) {
        await page.screenshot({ path: 'error.png' });
        throw error;
    }
});
```

### Console Logs

```typescript
// Log page URL
console.log('Current URL:', page.url());

// Run code in browser context
const title = await page.evaluate(() => document.title);
console.log('Page title:', title);
```

## Migration from Component Tests

To convert existing component tests to E2E:

1. **Rename file**: `component.test.tsx` → `component.e2e.test.tsx`
2. **Import page context**: `import { page } from '@vitest/browser/context'`
3. **Add navigation**: `await page.goto(url)` in `beforeEach`
4. **Replace renders**: Remove `render()` calls - page already loaded
5. **Update queries**: Use `page.getBy*()` instead of `screen.getBy*()`
6. **Add waits**: Use `await expect.element().toBeInTheDocument()` patterns

## Example: Complete Test Suite

See `app/features/auth/login.e2e.test.tsx` for a complete example of E2E tests covering:
- Form rendering
- Validation
- User interactions
- Navigation
- Error states
- Success states
