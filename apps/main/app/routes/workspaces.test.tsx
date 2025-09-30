/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createBrowserRouter, RouterProvider } from 'react-router';

import WorkspacesPage, { loader } from './workspaces.js';

// Mock the API module
vi.mock('../lib/api/index.js', () => ({
    workspaceApi: {
        getUserWorkspaces: vi.fn()
    },
    ApiError: class extends Error {
        constructor(
            message: string,
            public status: number,
            public statusText: string
        ) {
            super(message);
        }
    }
}));

const mockWorkspaces = [
    {
        id: 'workspace-1',
        name: 'My First Workspace',
        slug: 'my-first-workspace',
        description: 'A workspace for testing',
        owner: 'user-1',
        members: [
            {
                user: 'user-1',
                role: 'owner',
                invitedAt: '2023-01-01',
                joinedAt: '2023-01-01'
            },
            {
                user: 'user-2',
                role: 'editor',
                invitedAt: '2023-01-02',
                joinedAt: '2023-01-02'
            }
        ],
        settings: {
            timezone: 'UTC',
            dateFormat: 'YYYY-MM-DD',
            numberFormat: 'en-US',
            defaultLanguage: 'en',
            features: {
                apiAccess: false,
                realTimeSync: true,
                advancedPermissions: false
            },
            branding: {}
        },
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
    },
    {
        id: 'workspace-2',
        name: 'Team Workspace',
        slug: 'team-workspace',
        description: 'Shared team workspace',
        owner: 'user-1',
        members: [
            {
                user: 'user-1',
                role: 'owner',
                invitedAt: '2023-01-01',
                joinedAt: '2023-01-01'
            }
        ],
        settings: {
            timezone: 'UTC',
            dateFormat: 'YYYY-MM-DD',
            numberFormat: 'en-US',
            defaultLanguage: 'en',
            features: {
                apiAccess: true,
                realTimeSync: true,
                advancedPermissions: true
            },
            branding: {}
        },
        createdAt: '2023-01-05T00:00:00Z',
        updatedAt: '2023-01-05T00:00:00Z'
    }
];

const createRouter = (loaderData: any) => {
    return createBrowserRouter([
        {
            path: '/',
            Component: WorkspacesPage,
            loader: () => loaderData
        }
    ]);
};

describe('WorkspacesPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders workspaces list successfully', async () => {
        const router = createRouter({
            workspaces: mockWorkspaces,
            error: null
        });

        render(<RouterProvider router={router} />);

        // Check header content
        expect(screen.getByText('Workspaces')).toBeInTheDocument();
        expect(
            screen.getByText(
                'Manage your workspaces and collaborate with your team'
            )
        ).toBeInTheDocument();
        expect(screen.getByText('New Workspace')).toBeInTheDocument();

        // Check workspace cards
        expect(screen.getByText('My First Workspace')).toBeInTheDocument();
        expect(screen.getByText('A workspace for testing')).toBeInTheDocument();
        expect(screen.getByText('Team Workspace')).toBeInTheDocument();
        expect(screen.getByText('Shared team workspace')).toBeInTheDocument();

        // Check member counts
        expect(screen.getByText('2 members')).toBeInTheDocument();
        expect(screen.getByText('1 member')).toBeInTheDocument();
    });

    it('handles empty workspaces state', async () => {
        const router = createRouter({ workspaces: [], error: null });

        render(<RouterProvider router={router} />);

        expect(screen.getByText('No workspaces yet')).toBeInTheDocument();
        expect(
            screen.getByText(
                'Create your first workspace to get started with Struktura'
            )
        ).toBeInTheDocument();
        expect(screen.getByText('Create Workspace')).toBeInTheDocument();
    });

    it('handles error state', async () => {
        const router = createRouter({
            workspaces: [],
            error: 'Failed to load workspaces'
        });

        render(<RouterProvider router={router} />);

        expect(
            screen.getByText('Unable to load workspaces')
        ).toBeInTheDocument();
        expect(
            screen.getByText('Failed to load workspaces')
        ).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('filters workspaces based on search query', async () => {
        const router = createRouter({
            workspaces: mockWorkspaces,
            error: null
        });

        render(<RouterProvider router={router} />);

        const searchInput = screen.getByPlaceholderText('Search workspaces...');

        // Search for specific workspace
        fireEvent.change(searchInput, { target: { value: 'Team' } });

        expect(screen.getByText('Team Workspace')).toBeInTheDocument();
        expect(
            screen.queryByText('My First Workspace')
        ).not.toBeInTheDocument();
    });

    it('shows no results when search has no matches', async () => {
        const router = createRouter({
            workspaces: mockWorkspaces,
            error: null
        });

        render(<RouterProvider router={router} />);

        const searchInput = screen.getByPlaceholderText('Search workspaces...');

        // Search for non-existent workspace
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

        expect(screen.getByText('No workspaces found')).toBeInTheDocument();
        expect(
            screen.getByText('Try adjusting your search terms')
        ).toBeInTheDocument();
        expect(screen.getByText('Clear Search')).toBeInTheDocument();
    });

    it('switches between grid and list view modes', async () => {
        const router = createRouter({
            workspaces: mockWorkspaces,
            error: null
        });

        render(<RouterProvider router={router} />);

        // Should start in grid view (default)
        const listButton = screen.getByRole('button', { name: /list/i });
        const gridButton = screen.getByRole('button', { name: /grid/i });

        // Switch to list view
        fireEvent.click(listButton);

        // Both workspaces should still be visible
        expect(screen.getByText('My First Workspace')).toBeInTheDocument();
        expect(screen.getByText('Team Workspace')).toBeInTheDocument();

        // Switch back to grid view
        fireEvent.click(gridButton);

        // Both workspaces should still be visible
        expect(screen.getByText('My First Workspace')).toBeInTheDocument();
        expect(screen.getByText('Team Workspace')).toBeInTheDocument();
    });
});

describe('Workspaces loader', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('loads workspaces successfully', async () => {
        const { workspaceApi } = await import('../lib/api/index.js');
        workspaceApi.getUserWorkspaces = vi
            .fn()
            .mockResolvedValue(mockWorkspaces);

        const request = new Request('http://localhost/workspaces');
        const result = await loader({ request, params: {}, context: {} });

        expect(result).toEqual({
            workspaces: mockWorkspaces,
            error: null
        });
    });

    it('handles API errors gracefully', async () => {
        const { workspaceApi } = await import('../lib/api/index.js');
        const error = new Error('API Error');
        workspaceApi.getUserWorkspaces = vi.fn().mockRejectedValue(error);

        const request = new Request('http://localhost/workspaces');
        const result = await loader({ request, params: {}, context: {} });

        expect(result).toEqual({
            workspaces: [],
            error: 'API Error'
        });
    });
});
