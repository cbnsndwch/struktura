/**
 * Test utilities for React Router 7 components
 * Provides helpers to properly render components with router context
 */
import { type ReactElement } from 'react';
import {
    render,
    type RenderOptions,
    type RenderResult
} from '@testing-library/react';
import {
    createMemoryRouter,
    RouterProvider,
    type RouteObject
} from 'react-router';

import { AuthProvider } from '@/lib/auth-context.js';

type RouterRenderResult = RenderResult & {
    router: ReturnType<typeof createMemoryRouter>;
};

interface RouterRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    /**
     * Initial URL entries for the memory router
     * @default ['/']
     */
    initialEntries?: string[];

    /**
     * Route configuration
     * If not provided, creates a single route matching the component
     */
    routes?: RouteObject[];

    /**
     * Wrap component with AuthProvider
     * @default false
     */
    withAuth?: boolean;

    /**
     * Initial index for memory router
     * @default 0
     */
    initialIndex?: number;

    /**
     * Loader data to be returned by useLoaderData()
     * Creates a route with a loader that returns this data
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loaderData?: any;
}

/**
 * Render a component with React Router context
 *
 * @example
 * ```tsx
 * renderWithRouter(<Login />, {
 *   initialEntries: ['/auth/login']
 * });
 * ```
 */
export function renderWithRouter(
    component: ReactElement,
    options: RouterRenderOptions = {}
): RouterRenderResult {
    const {
        initialEntries = ['/'],
        routes,
        withAuth = false,
        initialIndex = 0,
        loaderData,
        ...renderOptions
    } = options;

    // Create default route configuration if not provided
    const routeConfig: RouteObject[] = routes || [
        {
            path: '*',
            element: withAuth ? (
                <AuthProvider>{component}</AuthProvider>
            ) : (
                component
            ),
            // If loaderData is provided, create a loader function
            ...(loaderData && {
                loader: () => loaderData
            })
        }
    ];

    // Create memory router
    const router = createMemoryRouter(routeConfig, {
        initialEntries,
        initialIndex
    });

    // Render with router provider
    return {
        ...render(<RouterProvider router={router} />, renderOptions),
        router
    };
}

/**
 * Render a component with both Router and Auth context
 *
 * @example
 * ```tsx
 * renderWithAuth(<Dashboard />, {
 *   initialEntries: ['/dashboard']
 * });
 * ```
 */
export function renderWithAuth(
    component: ReactElement,
    options: Omit<RouterRenderOptions, 'withAuth'> = {}
): RouterRenderResult {
    return renderWithRouter(component, {
        ...options,
        withAuth: true
    });
}

/**
 * Create a test route configuration
 * Useful for testing components that need specific route hierarchies
 *
 * @example
 * ```tsx
 * const routes = createTestRoutes({
 *   path: '/auth',
 *   children: [
 *     { path: 'login', element: <Login /> },
 *     { path: 'signup', element: <Signup /> }
 *   ]
 * });
 *
 * renderWithRouter(<Outlet />, { routes, initialEntries: ['/auth/login'] });
 * ```
 */
export function createTestRoutes(...routes: RouteObject[]): RouteObject[] {
    return routes;
}
