# Test Status Summary

## 🚀 E2E Test Migration - IN PROGRESS

We are replacing the failing unit/component tests with E2E tests using Vitest browser mode.

### Infrastructure Status: ✅ Complete

- [x] Installed `@vitest/browser` and `playwright` dependencies
- [x] Created `vitest.browser.config.ts` configuration
- [x] Set up E2E utilities in `src/test/e2e-utils.ts`
- [x] Created E2E setup in `src/test/e2e-setup.ts`
- [x] Added npm scripts: `test:e2e`, `test:e2e:watch`, `test:e2e:ui`
- [x] Documented E2E approach in `docs/E2E_TESTING_GUIDE.md`

### Test Files Status: 🔄 1/4 Complete

| File                                              | Status      | Tests     | Notes                                                   |
| ------------------------------------------------- | ----------- | --------- | ------------------------------------------------------- |
| `app/features/auth/login.e2e.test.tsx`            | ✅ Complete | 6         | Renders, OAuth, validation, password toggle, navigation |
| `app/features/auth/signup.e2e.test.tsx`           | ⏳ Pending  | 7 needed  | Replace signup.test.tsx                                 |
| `app/features/onboarding/onboarding.e2e.test.tsx` | ⏳ Pending  | 13 needed | Replace onboarding.test.tsx                             |
| `app/features/workspaces/workspaces.e2e.test.tsx` | ⏳ Pending  | 6 needed  | Replace workspaces.test.tsx                             |

### Running E2E Tests

```bash
# Terminal 1: Start the dev server
pnpm dev

# Terminal 2: Run E2E tests
pnpm test:e2e
```

**Important**: E2E tests require the application server to be running at `http://localhost:3000`.

### Next Steps

1. ✅ Complete login E2E tests
2. ⏳ Create signup E2E tests
3. ⏳ Create onboarding E2E tests
4. ⏳ Create workspaces E2E tests
5. ⏳ Verify all E2E tests pass
6. ⏳ Archive or remove old failing unit tests
7. ⏳ Update CI pipeline to run E2E tests

---

## Current Status (Unit Tests)

**Tests are no longer hanging** ✅ - Fixed performance issues  
**37 tests failing** ❌ - All rendering empty `<body />` (being replaced with E2E)

## Root Cause

The failing tests have a fundamental architectural mismatch:

1. **Components use `useLoaderData()`** - They expect data from React Router loaders
2. **Tests use direct rendering** - They render components with `<Component />` syntax
3. **Router context missing** - Without proper route setup, loader data never populates

### Example from WorkspacesPage:

```tsx
// Component expects this:
function WorkspacesPage() {
    const { workspaces, error } = useLoaderData(); // ❌ Returns undefined in tests
    // ...
}

// Test does this:
renderWithRouter(<WorkspacesPage />, {
    loaderData: { workspaces: [], error: null } // ❌ Doesn't work - loader never called
});
```

## Why `loaderData` Option Doesn't Work

The `loaderData` option I added to `renderWithRouter` creates a route WITH a loader function, but `useLoaderData()` inside the component still returns `undefined` because:

1. React Router's `useLoaderData()` hook reads from route context
2. The component is rendered directly (`<WorkspacesPage />`), not through route matching
3. The loader function exists but is never executed

## Solutions

### Option 1: Mock `useLoaderData` Globally (Quick Fix)

Update `src/test/setup.ts` to automatically mock `useLoaderData`:

```typescript
import { vi } from 'vitest';

// Global useLoaderData mock
let mockLoaderData: any = {};

vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useLoaderData: () => mockLoaderData
    };
});

// Expose setter for tests
global.setMockLoaderData = (data: any) => {
    mockLoaderData = data;
};
```

Then in tests:

```typescript
it('renders workspaces', () => {
  global.setMockLoaderData({ workspaces: mockData, error: null });
  renderWithRouter(<WorkspacesPage />);
  expect(screen.getByText('Workspaces')).toBeInTheDocument();
});
```

**Pros**: Quick, minimal test changes  
**Cons**: Fragile, doesn't test actual routing behavior

### Option 2: Render Through Actual Routes (Correct Approach)

Create proper route configurations in tests:

```typescript
it('renders workspaces', async () => {
  const { router } = renderWithRouter(null, {
    routes: [
      {
        path: '/workspaces',
        element: <WorkspacesPage />,
        loader: () => ({ workspaces: mockData, error: null })
      }
    ],
    initialEntries: ['/workspaces']
  });

  // Component renders through route matching
  expect(await screen.findByText('Workspaces')).toBeInTheDocument();
});
```

**Pros**: Tests actual routing behavior, more robust  
**Cons**: Requires rewriting tests

### Option 3: Component Refactoring (Best Long-term)

Separate data loading from presentation:

```typescript
// Presentation component (easy to test)
export function WorkspacesView({ workspaces, error }: WorkspacesViewProps) {
  // UI logic only
}

// Route component (uses loader)
export default function WorkspacesPage() {
  const data = useLoaderData();
  return <WorkspacesView {...data} />;
}
```

Then test the view directly:

```typescript
it('renders workspaces', () => {
  render(<WorkspacesView workspaces={mockData} error={null} />);
  expect(screen.getByText('Workspaces')).toBeInTheDocument();
});
```

**Pros**: Clean separation, easy testing, best practice  
**Cons**: Requires component refactoring

## Recommended Path Forward

**Immediate** (to unblock):

1. Implement Option 1 (global mock) in `src/test/setup.ts`
2. Update all failing tests to use `global.setMockLoaderData()`
3. Get CI green

**Short-term**:

1. Implement Option 2 for new tests
2. Create helper: `renderRoute(path, loader, element)`

**Long-term**:

1. Refactor components following Option 3
2. Separate presentation from data loading
3. Test views directly without routing overhead

## Files to Modify

### Immediate Fix:

- `apps/main/src/test/setup.ts` - Add global mock
- `apps/main/app/features/auth/login.test.tsx` - Use global mock (11 tests)
- `apps/main/app/features/auth/signup.test.tsx` - Use global mock (7 tests)
- `apps/main/app/features/onboarding/onboarding.test.tsx` - Use global mock (13 tests)
- `apps/main/app/features/workspaces/workspaces.test.tsx` - Use global mock (6 tests)

### Component Updates (Long-term):

- `apps/main/app/features/workspaces/workspaces.tsx` - Split into View + Page
- `apps/main/app/features/auth/login.tsx` - Split into View + Page
- `apps/main/app/features/auth/signup.tsx` - Split into View + Page
- `apps/main/app/features/onboarding/onboarding.tsx` - Split into View + Page

## Current Test Status

| Suite                            | Total  | Pass   | Fail   | Skip  |
| -------------------------------- | ------ | ------ | ------ | ----- |
| test:unit (auth-context)         | 5      | 5 ✅   | 0      | 0     |
| test:components (ProtectedRoute) | 5      | 0      | 0      | 5 ⏭️  |
| test:features (all)              | 41     | 13     | 37 ❌  | 0     |
| **TOTAL**                        | **51** | **18** | **37** | **5** |

### Breakdown of Failures:

- Login component: 11 failures
- Signup component: 7 failures
- Onboarding: 13 failures
- Workspaces: 6 failures

**All failures have the same root cause**: `<body />` empty render due to `useLoaderData()` returning `undefined`.
