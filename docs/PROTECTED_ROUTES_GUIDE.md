# Protected Route System - Usage Guide

## Overview

The Struktura application now has a comprehensive protected route system that handles authentication state, redirects, and access control. This guide explains how to use the new components and utilities.

## Components

### AuthProvider

The `AuthProvider` wraps the entire application and provides authentication state to all child components.

**Already configured in `app/root.tsx`** - No action needed for basic usage.

```tsx
// app/root.tsx (already done)
import { AuthProvider } from './lib/auth-context.js';

export default function App() {
    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    );
}
```

### ProtectedRoute

Wrapper component that ensures a route requires authentication before rendering.

**Features:**
- Automatic redirect to login for unauthenticated users
- Loading state while checking authentication
- Role-based access control
- Deep link preservation

**Basic Usage:**

```tsx
import { ProtectedRoute } from '../components/ProtectedRoute.js';

export default function MyProtectedPage() {
    return (
        <ProtectedRoute>
            <div>This content is only visible to authenticated users</div>
        </ProtectedRoute>
    );
}
```

**With Role-Based Access:**

```tsx
export default function AdminPanel() {
    return (
        <ProtectedRoute requiredRoles={['admin']}>
            <div>Admin-only content</div>
        </ProtectedRoute>
    );
}
```

**Custom Redirect:**

```tsx
export default function SpecialPage() {
    return (
        <ProtectedRoute redirectTo="/auth/custom-login">
            <div>Protected content</div>
        </ProtectedRoute>
    );
}
```

**Without Loading Spinner:**

```tsx
export default function QuietPage() {
    return (
        <ProtectedRoute showLoader={false}>
            <div>Protected content without loading UI</div>
        </ProtectedRoute>
    );
}
```

### WorkspaceGuard

Component that validates workspace access and membership.

**Features:**
- Verifies workspace exists and user has access
- Role-based workspace permissions
- Graceful error handling
- Retry functionality

**Basic Usage:**

```tsx
import { WorkspaceGuard } from '../components/WorkspaceGuard.js';

export default function WorkspacePage() {
    return (
        <WorkspaceGuard>
            <div>Workspace content - user is a member</div>
        </WorkspaceGuard>
    );
}
```

**With Required Role:**

```tsx
export default function WorkspaceSettings() {
    return (
        <WorkspaceGuard requiredRole="admin">
            <div>Settings - user must be admin or owner</div>
        </WorkspaceGuard>
    );
}
```

**Role Hierarchy:**
- `viewer` - Can view workspace content
- `editor` - Can edit content  
- `admin` - Can manage workspace settings
- `owner` - Full control over workspace

## Hooks

### useAuth

Access authentication state and functions anywhere in the app.

```tsx
import { useAuth } from '../lib/auth-context.js';

export default function MyComponent() {
    const { isAuthenticated, user, isLoading, logout } = useAuth();
    
    if (isLoading) {
        return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
        return <div>Please log in</div>;
    }
    
    return (
        <div>
            <p>Welcome, {user?.name}!</p>
            <button onClick={logout}>Sign Out</button>
        </div>
    );
}
```

**Available Properties:**
- `isAuthenticated`: boolean
- `isLoading`: boolean
- `user`: AuthUser | null
- `error`: string | null
- `checkAuth()`: async function to refresh auth state
- `logout()`: async function to sign out

## Server-Side Protection

For routes that need server-side authentication checking (e.g., for data loading), use the server utilities in loaders.

### requireServerAuth

```tsx
import type { LoaderFunctionArgs } from 'react-router';
import { requireServerAuth } from '../lib/auth.server.js';

export async function loader({ request }: LoaderFunctionArgs) {
    // Throws redirect to login if not authenticated
    const auth = requireServerAuth(request);
    
    // auth.user contains user data
    const data = await fetchDataForUser(auth.user.id);
    
    return { data };
}
```

### getServerAuth

For conditional server-side checking:

```tsx
import { getServerAuth } from '../lib/auth.server.js';

export async function loader({ request }: LoaderFunctionArgs) {
    const auth = getServerAuth(request);
    
    if (auth.isAuthenticated) {
        // User is logged in
        return { user: auth.user };
    } else {
        // User is not logged in - show public content
        return { user: null };
    }
}
```

## Client-Side Utilities

### isAuthenticated

Check if user is authenticated:

```tsx
import { isAuthenticated } from '../lib/auth.js';

if (isAuthenticated()) {
    // User is logged in
}
```

### isTokenExpired

Check if JWT token is expired:

```tsx
import { isTokenExpired } from '../lib/auth.js';

const token = localStorage.getItem('access_token');
if (token && isTokenExpired(token)) {
    // Token has expired
}
```

### refreshAccessToken

Manually refresh the access token:

```tsx
import { refreshAccessToken } from '../lib/auth.js';

const refreshed = await refreshAccessToken();
if (refreshed) {
    // Token successfully refreshed
} else {
    // Refresh failed - redirect to login
}
```

### checkAuthWithRefresh

Check auth and auto-refresh if needed:

```tsx
import { checkAuthWithRefresh } from '../lib/auth.js';

const isAuth = await checkAuthWithRefresh();
if (isAuth) {
    // User is authenticated (possibly after refresh)
}
```

## Authentication Flow

### Login Flow

1. User visits protected route
2. `ProtectedRoute` checks authentication
3. If not authenticated, redirect to `/auth/login?redirectTo=/protected-route`
4. User logs in
5. Login handler stores tokens and redirects to `redirectTo` or `/dashboard`

### Token Refresh Flow

1. `isAuthenticated()` checks if token is expired
2. If expired, `refreshAccessToken()` is called
3. If refresh succeeds, new tokens are stored
4. User continues without interruption
5. If refresh fails, user is redirected to login

### Logout Flow

1. User clicks logout
2. `logout()` from `useAuth` is called
3. Logout API is called (optional)
4. Local tokens are cleared
5. User is redirected to `/auth/login`

## Route Configuration Examples

### Protected Route in routes.ts

Routes are automatically protected when using server loaders with `requireServerAuth`:

```tsx
import { type RouteConfig, route } from '@react-router/dev/routes';

export default [
    route('admin', 'routes/admin.tsx'), // Use requireServerAuth in loader
    route('settings', 'routes/settings.tsx')
] satisfies RouteConfig;
```

### Public Route

Add to PUBLIC_ROUTES in `app/lib/auth.ts`:

```tsx
export const PUBLIC_ROUTES = [
    '/',
    '/auth/login',
    '/auth/signup',
    '/your-public-route',
    // ...
];
```

## Error Handling

### Session Expiration

When a user's session expires:
1. Auth check detects expired token
2. Attempts token refresh
3. If refresh fails, tokens are cleared
4. User is redirected to login with return URL

### Access Denied

When a user lacks permissions:
1. Role/workspace check fails
2. User sees `/unauthorized` page
3. Options to go back or return to workspaces

### Network Errors

When API calls fail:
1. Error is caught and logged
2. User sees appropriate error message
3. Option to retry authentication check

## Best Practices

### 1. Use Server-Side Auth for Data Loading

```tsx
// ✅ Good - Server-side check
export async function loader({ request }: LoaderFunctionArgs) {
    const auth = requireServerAuth(request);
    return { data: await fetchUserData(auth.user.id) };
}

// ❌ Avoid - Client-side only
export default function Page() {
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
        }
    }, []);
}
```

### 2. Combine Server and Client Protection

```tsx
// Loader for server-side
export async function loader({ request }: LoaderFunctionArgs) {
    requireServerAuth(request);
    return { data };
}

// Component for client-side
export default function Page() {
    return (
        <ProtectedRoute>
            <Content />
        </ProtectedRoute>
    );
}
```

### 3. Handle Loading States

```tsx
export default function MyPage() {
    const { isLoading, isAuthenticated, user } = useAuth();
    
    if (isLoading) {
        return <LoadingSpinner />;
    }
    
    if (!isAuthenticated) {
        return <LoginPrompt />;
    }
    
    return <Content user={user} />;
}
```

### 4. Role-Based UI

```tsx
export default function Dashboard() {
    const { user } = useAuth();
    
    return (
        <div>
            <h1>Dashboard</h1>
            
            {user?.roles.includes('admin') && (
                <AdminPanel />
            )}
            
            {user?.roles.includes('editor') && (
                <EditorTools />
            )}
        </div>
    );
}
```

## Testing

### Testing Protected Routes

```tsx
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../lib/auth-context.js';
import { ProtectedRoute } from '../components/ProtectedRoute.js';

test('shows content when authenticated', async () => {
    // Mock isAuthenticated to return true
    vi.mock('../lib/auth.js', () => ({
        isAuthenticated: () => true
    }));
    
    render(
        <AuthProvider>
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>
        </AuthProvider>
    );
    
    expect(await screen.findByText('Protected Content')).toBeInTheDocument();
});
```

## Troubleshooting

### Issue: Infinite redirect loop
**Solution:** Check that login route is in PUBLIC_ROUTES

### Issue: Protected content flashes before redirect
**Solution:** Use server-side auth in loader for SSR protection

### Issue: Token refresh not working
**Solution:** Verify `/api/auth/refresh` endpoint exists and refresh token is valid

### Issue: User stuck on loading screen
**Solution:** Check `/api/auth/me` endpoint and network tab for errors
