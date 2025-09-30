import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { AuthProvider } from '../lib/auth-context.js';

import { ProtectedRoute } from './ProtectedRoute.js';

// Mock the auth utilities
vi.mock('../lib/auth.js', () => ({
    isAuthenticated: vi.fn(),
    isPublicRoute: vi.fn(),
    PUBLIC_ROUTES: ['/auth/login']
}));

// Mock fetch
global.fetch = vi.fn();

describe.skip('ProtectedRoute Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup localStorage mock
        const localStorageMock = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn()
        };
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });
    });

    const renderProtectedRoute = (
        children: React.ReactNode,
        initialPath = '/protected'
    ) => {
        const router = createMemoryRouter(
            [
                {
                    path: '/',
                    element: (
                        <AuthProvider>
                            <ProtectedRoute>{children}</ProtectedRoute>
                        </AuthProvider>
                    ),
                    children: [
                        {
                            path: 'protected',
                            element: (
                                <AuthProvider>
                                    <ProtectedRoute>{children}</ProtectedRoute>
                                </AuthProvider>
                            )
                        },
                        {
                            path: 'auth/login',
                            element: <div>Login Page</div>
                        }
                    ]
                }
            ],
            {
                initialEntries: [initialPath]
            }
        );

        return render(<RouterProvider router={router} />);
    };

    it('should show loading state initially', async () => {
        const { isAuthenticated } = await import('../lib/auth.js');
        vi.mocked(isAuthenticated).mockReturnValue(false);

        // Mock fetch to delay the auth check
        vi.mocked(global.fetch).mockImplementation(
            () =>
                new Promise(() => {
                    // Never resolve to keep loading state
                })
        );

        renderProtectedRoute(<div>Protected Content</div>);

        expect(
            screen.getByText('Verifying authentication...')
        ).toBeInTheDocument();
    });

    it('should render children when authenticated', async () => {
        const { isAuthenticated } = await import('../lib/auth.js');
        vi.mocked(isAuthenticated).mockReturnValue(true);

        // Mock successful auth check
        vi.mocked(global.fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                id: 'user1',
                email: 'test@example.com',
                name: 'Test User',
                roles: ['user'],
                emailVerified: true
            })
        } as Response);

        renderProtectedRoute(<div>Protected Content</div>);

        await waitFor(() => {
            expect(screen.getByText('Protected Content')).toBeInTheDocument();
        });
    });

    it('should not render children when not authenticated', async () => {
        const { isAuthenticated } = await import('../lib/auth.js');
        vi.mocked(isAuthenticated).mockReturnValue(false);

        vi.mocked(global.fetch).mockResolvedValueOnce({
            ok: false,
            status: 401
        } as Response);

        renderProtectedRoute(<div>Protected Content</div>);

        await waitFor(() => {
            expect(
                screen.queryByText('Protected Content')
            ).not.toBeInTheDocument();
        });
    });

    it('should check role-based access when requiredRoles are specified', async () => {
        const { isAuthenticated } = await import('../lib/auth.js');
        vi.mocked(isAuthenticated).mockReturnValue(true);

        // Mock user with 'user' role
        vi.mocked(global.fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                id: 'user1',
                email: 'test@example.com',
                name: 'Test User',
                roles: ['user'],
                emailVerified: true
            })
        } as Response);

        const router = createMemoryRouter(
            [
                {
                    path: '/',
                    element: (
                        <AuthProvider>
                            <ProtectedRoute requiredRoles={['admin']}>
                                <div>Admin Content</div>
                            </ProtectedRoute>
                        </AuthProvider>
                    ),
                    children: [
                        {
                            path: 'unauthorized',
                            element: <div>Unauthorized Page</div>
                        }
                    ]
                }
            ],
            {
                initialEntries: ['/']
            }
        );

        render(<RouterProvider router={router} />);

        // User should not see admin content since they don't have admin role
        await waitFor(() => {
            expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
        });
    });

    it('should render children when user has required role', async () => {
        const { isAuthenticated } = await import('../lib/auth.js');
        vi.mocked(isAuthenticated).mockReturnValue(true);

        // Mock user with 'admin' role
        vi.mocked(global.fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                id: 'user1',
                email: 'admin@example.com',
                name: 'Admin User',
                roles: ['user', 'admin'],
                emailVerified: true
            })
        } as Response);

        const router = createMemoryRouter(
            [
                {
                    path: '/',
                    element: (
                        <AuthProvider>
                            <ProtectedRoute requiredRoles={['admin']}>
                                <div>Admin Content</div>
                            </ProtectedRoute>
                        </AuthProvider>
                    )
                }
            ],
            {
                initialEntries: ['/']
            }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            expect(screen.getByText('Admin Content')).toBeInTheDocument();
        });
    });
});
