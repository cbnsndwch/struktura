import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { AuthProvider, useAuth } from './auth-context.js';

// Mock session state that we can manipulate per test
let mockSessionData: {
    user: { id: string; email: string; name?: string; emailVerified?: boolean } | null;
    session: unknown;
} | null = null;
let mockIsPending = false;
let mockError: Error | null = null;
const mockRefetch = vi.fn();
const mockSignOut = vi.fn();

// Mock the auth-client module
vi.mock('./auth-client.js', () => ({
    useSession: () => ({
        data: mockSessionData,
        isPending: mockIsPending,
        error: mockError,
        refetch: mockRefetch
    }),
    signOut: () => mockSignOut()
}));

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset mock session state
        mockSessionData = null;
        mockIsPending = false;
        mockError = null;
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
        // Session not authenticated
        mockSessionData = null;
        mockIsPending = false;

        const { result } = renderHook(() => useAuth(), { wrapper });

        // Wait for state to settle
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        // Should not be authenticated
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBe(null);
    });

    it('should update auth state after checking authentication', async () => {
        // Session is authenticated with user data
        mockSessionData = {
            user: {
                id: 'user1',
                email: 'test@example.com',
                name: 'Test User',
                emailVerified: true
            },
            session: {}
        };
        mockIsPending = false;

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(result.current.isAuthenticated).toBe(true);
            expect(result.current.user).toEqual({
                id: 'user1',
                email: 'test@example.com',
                name: 'Test User',
                emailVerified: true
            });
        });
    });

    it('should handle authentication check failure', async () => {
        // Session check failed with error
        mockSessionData = null;
        mockIsPending = false;
        mockError = new Error('Session expired');

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(result.current.isAuthenticated).toBe(false);
            expect(result.current.user).toBe(null);
            expect(result.current.error).toBe('Session expired');
        });
    });

    it('should handle logout', async () => {
        // Start with authenticated session
        mockSessionData = {
            user: {
                id: 'user1',
                email: 'test@example.com',
                name: 'Test User',
                emailVerified: true
            },
            session: {}
        };
        mockIsPending = false;
        mockSignOut.mockResolvedValue(undefined);

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.isAuthenticated).toBe(true);
        });

        // Call logout
        await act(async () => {
            await result.current.logout();
        });

        // Verify signOut was called
        expect(mockSignOut).toHaveBeenCalled();
    });

    it('should throw error when useAuth is used outside AuthProvider', () => {
        expect(() => {
            renderHook(() => useAuth());
        }).toThrow('useAuth must be used within an AuthProvider');
    });
});
