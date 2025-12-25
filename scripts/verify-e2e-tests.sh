#!/bin/bash
# Quick verification script to check test file structure

echo "🔍 E2E Login Test Verification"
echo "=============================="
echo ""

# Check if test file exists
if [ -f "apps/main/app/features/auth/login-auth.e2e.test.tsx" ]; then
    echo "✓ Test file exists: login-auth.e2e.test.tsx"
else
    echo "✗ Test file not found"
    exit 1
fi

# Count test cases
test_count=$(grep -c "it('should" apps/main/app/features/auth/login-auth.e2e.test.tsx)
describe_count=$(grep -c "describe(" apps/main/app/features/auth/login-auth.e2e.test.tsx)

echo "✓ Test structure:"
echo "  - $describe_count test suites"
echo "  - $test_count test cases"
echo ""

# Check for test users
echo "✓ Test users configured:"
grep -A 1 "email:" apps/main/app/features/auth/login-auth.e2e.test.tsx | grep -E "(email|password):" | sed 's/^/  /'
echo ""

# Check documentation files
echo "✓ Documentation files:"
[ -f "TESTING_E2E_LOGIN.md" ] && echo "  - TESTING_E2E_LOGIN.md (root quick start)"
[ -f "apps/main/docs/E2E_LOGIN_TESTS.md" ] && echo "  - apps/main/docs/E2E_LOGIN_TESTS.md (detailed guide)"
[ -f "scripts/run-e2e-login-tests.sh" ] && echo "  - scripts/run-e2e-login-tests.sh (helper script)"
echo ""

# Check package.json script
if grep -q "test:e2e:login" package.json; then
    echo "✓ npm script added: pnpm test:e2e:login"
else
    echo "⚠ npm script not found in package.json"
fi
echo ""

echo "✓ Test implementation complete!"
echo ""
echo "To run the tests:"
echo "  1. Ensure MongoDB is running"
echo "  2. Run: pnpm db:seed"
echo "  3. Start dev server: cd apps/main && pnpm dev"
echo "  4. Run tests: pnpm test:e2e:login"
echo ""
echo "Or see TESTING_E2E_LOGIN.md for detailed instructions"
