# E2E Login Authentication Tests

This document describes how to run and maintain the E2E tests for login authentication with seeded test users.

## Overview

The E2E login authentication tests verify that users can successfully log in using the Better Auth authentication system. These tests run in a real browser using Vitest browser mode with Playwright.

## Test File

- **Location**: `app/features/auth/login-auth.e2e.test.tsx`
- **Test Framework**: Vitest with Browser Mode (Playwright/Chromium)
- **Authentication**: Better Auth with session cookies

## Prerequisites

### 1. MongoDB Running

Ensure MongoDB is running on the default development port:

```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# If not running, start MongoDB (method depends on your installation)
# macOS with Homebrew:
brew services start mongodb-community

# Linux with systemd:
sudo systemctl start mongod

# Docker:
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

The tests expect MongoDB at: `mongodb://[::1]:27017/struktura-dev`

### 2. Seed Test Users

Run the seed script to create the three test user accounts:

```bash
# From the repository root
pnpm db:seed

# Or from apps/main
cd apps/main
pnpm --filter @cbnsndwch/struktura-main --dir ../.. db:seed
```

This creates three users:

| Email | Password | Role | Name |
|-------|----------|------|------|
| test@example.com | password123 | editor | Test User |
| admin@example.com | admin123 | admin | Admin User |
| viewer@example.com | viewer123 | viewer | Viewer User |

### 3. Start Development Server

The tests require the application to be running:

```bash
# From apps/main directory
cd apps/main
pnpm dev
```

Wait for the server to start (typically at http://localhost:3000).

## Running the Tests

### Run All E2E Tests

```bash
cd apps/main
pnpm test:e2e
```

### Run in Watch Mode

```bash
cd apps/main
pnpm test:e2e:watch
```

### Run with UI

```bash
cd apps/main
pnpm test:e2e:ui
```

### Run in Non-Headless Mode (Visible Browser)

Edit `vitest.browser.config.ts` temporarily:

```typescript
browser: {
    enabled: true,
    name: 'chromium',
    provider: 'playwright',
    headless: false  // Change to false
}
```

## Test Coverage

### Successful Login Tests

- ✅ Login with test@example.com (editor role)
- ✅ Login with admin@example.com (admin role)
- ✅ Login with viewer@example.com (viewer role)

### Failed Login Tests

- ✅ Invalid password shows error
- ✅ Non-existent user shows error

### Session Management Tests

- ✅ Session isolation between different users
- ✅ Session persistence after page refresh

### Form Validation Tests

- ✅ Empty email shows validation error
- ✅ Empty password shows validation error
- ✅ Invalid email format shows validation error

## How It Works

### Session Management

The tests use Better Auth's session cookie system:

1. **Session Clearing**: Before each test, cookies and storage are cleared to ensure a fresh state
2. **Login Process**: Tests fill the login form and submit credentials
3. **Success Verification**: Successful login redirects away from `/auth/login` to `/dashboard` or `/workspaces`
4. **Session Cookies**: Better Auth automatically sets httpOnly cookies for session management

### Test Utilities

```typescript
// Clear all session data (cookies, localStorage, sessionStorage)
await clearSession();

// Navigate to login page and wait for it to load
await navigateToLogin();

// Fill and submit login form
await submitLogin(email, password);

// Wait for successful login redirect
await waitForLoginSuccess();
```

### Browser Context

Vitest browser mode provides:
- Real browser environment (Chromium via Playwright)
- Automatic cookie management
- DOM manipulation APIs
- User interaction simulation

## Troubleshooting

### Tests Fail with "Server not responding"

**Problem**: Dev server is not running.

**Solution**: Start the dev server in a separate terminal:
```bash
cd apps/main
pnpm dev
```

### Tests Fail with "Invalid credentials"

**Problem**: Database is not seeded with test users.

**Solution**: Run the seed script:
```bash
pnpm db:seed
```

### Tests Fail with "MongoDB connection error"

**Problem**: MongoDB is not running.

**Solution**: Start MongoDB (see Prerequisites section above).

### Tests Timeout

**Problem**: Application is slow to respond or not running properly.

**Solution**:
1. Check dev server logs for errors
2. Verify MongoDB connection
3. Check for port conflicts (port 3000)
4. Increase timeout in tests if needed

### Session Not Persisting

**Problem**: Better Auth session cookies not being set.

**Solution**:
1. Verify `BETTER_AUTH_SECRET` is set in environment
2. Check that cookies are enabled in browser context
3. Verify the app is running on http://localhost:3000 (same origin)

### Clear Test Database

If you need to reset the test database:

```bash
# Connect to MongoDB
mongosh struktura-dev

# Drop the database
use struktura-dev
db.dropDatabase()

# Re-seed users
cd /path/to/struktura
pnpm db:seed
```

## CI/CD Integration

To run these tests in CI/CD:

1. **Start MongoDB**: Use a Docker container or CI service
2. **Seed Database**: Run `pnpm db:seed` before tests
3. **Start Application**: Use `start-server-and-test` or similar
4. **Run Tests**: Execute `pnpm test:e2e`

Example GitHub Actions workflow:

```yaml
- name: Start MongoDB
  run: |
    docker run -d -p 27017:27017 mongo:7.0
    
- name: Seed Database
  run: pnpm db:seed
  env:
    DATABASE_URL: mongodb://localhost:27017/struktura-test
    
- name: Run E2E Tests
  run: |
    pnpm --filter @cbnsndwch/struktura-main dev &
    sleep 10
    pnpm --filter @cbnsndwch/struktura-main test:e2e
```

## Best Practices

1. **Isolation**: Always clear session between tests
2. **Waiting**: Use appropriate wait times for async operations
3. **Assertions**: Verify both success and failure cases
4. **Session**: Test with fresh browser contexts
5. **Cleanup**: Ensure tests don't leave residual state

## Future Enhancements

Potential improvements:

- [ ] Add tests for OAuth login flows (Google, GitHub)
- [ ] Test remember me functionality
- [ ] Test concurrent login sessions
- [ ] Add performance benchmarks for login speed
- [ ] Test network failure scenarios
- [ ] Add visual regression testing for login page

## Related Documentation

- [E2E Testing Guide](./E2E_TESTING_GUIDE.md) - General E2E testing guide
- [E2E Migration Summary](../E2E_MIGRATION_SUMMARY.md) - E2E migration from unit tests
- [Vitest Browser Mode Docs](https://vitest.dev/guide/browser.html)
- [Better Auth Documentation](https://www.better-auth.com/)
