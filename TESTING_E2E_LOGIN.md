# Running E2E Login Authentication Tests

This guide explains how to run the E2E tests that verify login functionality with the three seeded test users.

## Quick Start

### Prerequisites

1. **Install dependencies** (if not already done):
   ```bash
   pnpm install
   ```

2. **Ensure MongoDB is running**:
   ```bash
   # Check if running
   mongosh --eval "db.adminCommand('ping')"
   
   # Start if needed (method depends on installation)
   # macOS: brew services start mongodb-community
   # Linux: sudo systemctl start mongod
   # Docker: docker run -d -p 27017:27017 --name mongodb mongo:7.0
   ```

3. **Seed the database with test users**:
   ```bash
   pnpm db:seed
   ```
   
   This creates three test users:
   - `test@example.com` / `password123` (editor)
   - `admin@example.com` / `admin123` (admin)
   - `viewer@example.com` / `viewer123` (viewer)

4. **Start the development server** (in a separate terminal):
   ```bash
   cd apps/main
   pnpm dev
   ```
   
   Wait for the server to start at http://localhost:3000

### Running the Tests

#### Option 1: Use the Helper Script (Recommended)

```bash
# From repository root
pnpm test:e2e:login
```

This script will:
- Check MongoDB is running
- Check dev server is running
- Seed the database
- Run the E2E tests

#### Option 2: Manual Execution

```bash
# Terminal 1: Start the dev server
cd apps/main
pnpm dev

# Terminal 2: Seed database and run tests
pnpm db:seed
cd apps/main
pnpm test:e2e
```

## Test Coverage

The E2E login tests verify:

### ✅ Successful Login
- Login with `test@example.com` (editor role)
- Login with `admin@example.com` (admin role)
- Login with `viewer@example.com` (viewer role)

### ✅ Failed Login
- Invalid password shows error
- Non-existent user shows error

### ✅ Session Management
- Session isolation between different users
- Session persistence after page refresh

### ✅ Form Validation
- Empty email shows validation error
- Empty password shows validation error
- Invalid email format shows validation error

## Troubleshooting

### "Server not responding" or "ECONNREFUSED"

**Problem**: Dev server is not running.

**Solution**: Start the dev server:
```bash
cd apps/main
pnpm dev
```

### "Invalid credentials" errors

**Problem**: Database not seeded or users don't exist.

**Solution**: Run the seed script:
```bash
pnpm db:seed
```

### "MongoDB connection error"

**Problem**: MongoDB is not running.

**Solution**: Start MongoDB (see Prerequisites above).

### Tests timeout

**Problem**: Application is slow or not responding.

**Solution**:
1. Check dev server logs for errors
2. Verify MongoDB is running and accessible
3. Check for port conflicts on port 3000
4. Restart the dev server

### Clear and Reset

To start fresh:

```bash
# Stop dev server (Ctrl+C)

# Clear database
mongosh struktura-dev --eval "db.dropDatabase()"

# Re-seed
pnpm db:seed

# Restart dev server
cd apps/main
pnpm dev

# Run tests
pnpm test:e2e:login
```

## Test Files

- **Test file**: `apps/main/app/features/auth/login-auth.e2e.test.tsx`
- **Documentation**: `apps/main/docs/E2E_LOGIN_TESTS.md`
- **Helper script**: `scripts/run-e2e-login-tests.sh`

## Viewing Test Results

### Headless Mode (Default)

Tests run in headless Chromium with console output showing results.

### UI Mode

For interactive testing with visual feedback:

```bash
cd apps/main
pnpm test:e2e:ui
```

This opens a web UI showing all tests with real-time execution.

### Watch Mode

For continuous testing during development:

```bash
cd apps/main
pnpm test:e2e:watch
```

Tests automatically re-run when files change.

## Next Steps

After verifying login works with all three users:

1. ✅ All three seed users can log in successfully
2. ✅ Session management works correctly
3. ✅ Form validation behaves as expected
4. ✅ Ready to proceed with EPIC 3 implementation

## Related Documentation

- [E2E Login Tests Documentation](apps/main/docs/E2E_LOGIN_TESTS.md) - Detailed test documentation
- [E2E Testing Guide](apps/main/docs/E2E_TESTING_GUIDE.md) - General E2E testing practices
- [E2E Migration Summary](apps/main/E2E_MIGRATION_SUMMARY.md) - Migration from unit tests
- [Seed Script](scripts/seed-test-users.ts) - Test user creation script
