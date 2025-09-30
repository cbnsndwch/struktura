# Test Performance Issues - Investigation & Solutions

## Problem
Tests hang or take extremely long time to complete when running the full suite.

## Root Cause
1. **Heavy component tests** - React Router integration tests create full router instances
2. **Environment setup overhead** - Each test file spawns a fresh jsdom environment
3. **Module mocking** - Multiple vi.mock() calls add significant overhead

## Investigation Results

### Single File Performance
- Running a single test file: **~1.4 seconds** ✅
- Example: `vitest run app/lib/auth-context.test.tsx`

### Full Suite Performance  
- Running all 8 test files: **80+ seconds per file** ❌
- Total time: **10+ minutes** (effectively hangs)

## Workarounds

### Option 1: Run Tests by Pattern (RECOMMENDED)
```bash
# Run auth-related tests
pnpm test app/lib/auth

# Run feature tests
pnpm test app/features/auth

# Run component tests
pnpm test app/components
```

### Option 2: Use Watch Mode for Development
```bash
pnpm test:watch
```
This allows running specific tests interactively.

### Option 3: Split Test Script in package.json
```json
{
  "scripts": {
    "test": "vitest --run --passWithNoTests",
    "test:unit": "vitest --run app/lib --passWithNoTests",
    "test:components": "vitest --run app/components --passWithNoTests",  
    "test:features": "vitest --run app/features --passWithNoTests",
    "test:all": "pnpm test:unit && pnpm test:components && pnpm test:features"
  }
}
```

## Potential Fixes (To Investigate)

1. **Reduce router creation overhead** - Use simpler test wrappers
2. **Mock more aggressively** - Mock react-router components
3. **Optimize jsdom** - Consider using happy-dom instead
4. **Split large test files** - Break down feature tests into smaller units
5. **Use test.concurrent** - Leverage concurrent execution within files

## Current Configuration

```typescript
// vitest.config.ts
{
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 10000,
    hookTimeout: 10000,
    isolate: false,  // Reuse environment
    fileParallelism: false  // Run files sequentially
  }
}
```

## CI/CD Considerations

For CI pipelines, consider:
1. Running tests in parallel jobs by pattern
2. Using test sharding with Vitest's `--shard` flag
3. Caching node_modules and build outputs
4. Increasing runner resources (memory/CPU)
