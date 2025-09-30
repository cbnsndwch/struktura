import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { AuthProvider, useAuth } from './auth-context.js';

// Mock the auth utilities
vi.mock('./auth.js', () => ({
    isAuthenticated: vi.fn()
}));

// Mock fetch
global.fetch = vi.fn();

describe('AuthContext', () => {
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

    const wrapper = ({ children }: { children: React.ReactNode }) => {
        const router = createMemoryRouter(
            [
                {
                    path: '/',
                    element: <AuthProvider>{children}</AuthProvider>
                }
            ],
            {
                initialEntries: ['/']
            }
        );
        return <RouterProvider router={router} />;
    };

    it('should provide initial auth state', async () => {
        const { isAuthenticated } = await import('./auth.js');
        vi.mocked(isAuthenticated).mockReturnValue(false);

        const { result } = renderHook(() => useAuth(), { wrapper });

        // Initial state should show loading
        expect(result.current.isLoading).toBe(true);
    });

    it('should update auth state after checking authentication', async () => {
        const { isAuthenticated } = await import('./auth.js');
        vi.mocked(isAuthenticated).mockReturnValue(true);

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

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(result.current.isAuthenticated).toBe(true);
            expect(result.current.user).toEqual({
                id: 'user1',
                email: 'test@example.com',
                name: 'Test User',
                roles: ['user'],
                emailVerified: true
            });
        });
    });

    it('should handle authentication check failure', async () => {
        const { isAuthenticated } = await import('./auth.js');
        vi.mocked(isAuthenticated).mockReturnValue(true);

        vi.mocked(global.fetch).mockResolvedValueOnce({
            ok: false,
            status: 401
        } as Response);

        vi.mocked(window.localStorage.getItem).mockReturnValue('fake-token');

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(result.current.isAuthenticated).toBe(false);
            expect(result.current.user).toBe(null);
        });

        // Should clear tokens
        expect(window.localStorage.removeItem).toHaveBeenCalledWith(
            'access_token'
        );
        expect(window.localStorage.removeItem).toHaveBeenCalledWith(
            'refresh_token'
        );
    });

    it('should handle logout', async () => {
        const { isAuthenticated } = await import('./auth.js');
        vi.mocked(isAuthenticated).mockReturnValue(true);

        // Mock initial auth check
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

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.isAuthenticated).toBe(true);
        });

        // Mock logout API call
        vi.mocked(global.fetch).mockResolvedValueOnce({
            ok: true
        } as Response);

        // Call logout
        await result.current.logout();

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBe(null);
        expect(window.localStorage.removeItem).toHaveBeenCalledWith(
            'access_token'
        );
    });

    it('should throw error when useAuth is used outside AuthProvider', () => {
        expect(() => {
            renderHook(() => useAuth());
        }).toThrow('useAuth must be used within an AuthProvider');
    });
});
