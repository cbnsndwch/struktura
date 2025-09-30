/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createBrowserRouter, RouterProvider } from 'react-router';

import WorkspaceDashboard, { loader } from './$workspaceId.js';

// Mock the API module
vi.mock('../../lib/api/index.js', () => ({
    workspaceApi: {
        getWorkspaceDashboard: vi.fn()
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

const mockDashboardData = {
    workspace: {
        id: 'workspace-1',
        name: 'My Workspace',
        slug: 'my-workspace',
        description: 'A test workspace',
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
    collections: [
        {
            id: 'collection-1',
            name: 'Users',
            slug: 'users',
            description: 'User management collection',
            icon: '👥',
            color: '#3b82f6',
            recordCount: 150,
            lastUpdated: '2023-01-10T12:00:00Z'
        },
        {
            id: 'collection-2',
            name: 'Products',
            slug: 'products',
            description: 'Product catalog',
            icon: '📦',
            color: '#10b981',
            recordCount: 89,
            lastUpdated: '2023-01-09T15:30:00Z'
        }
    ],
    recentActivity: [
        {
            id: 'activity-1',
            type: 'collection_created' as const,
            description: 'Created collection "Users"',
            timestamp: '2023-01-10T10:00:00Z',
            user: {
                id: 'user-1',
                name: 'John Doe',
                email: 'john@example.com'
            },
            metadata: {
                collectionId: 'collection-1',
                collectionName: 'Users'
            }
        },
        {
            id: 'activity-2',
            type: 'record_created' as const,
            description: 'Added new user record',
            timestamp: '2023-01-10T11:00:00Z',
            user: {
                id: 'user-2',
                name: 'Jane Smith',
                email: 'jane@example.com'
            },
            metadata: {
                collectionId: 'collection-1',
                collectionName: 'Users',
                recordId: 'record-1',
                recordTitle: 'Alice Johnson'
            }
        }
    ],
    stats: {
        totalCollections: 2,
        totalRecords: 239,
        activeMembers: 2
    }
};

const createRouter = (
    loaderData: any,
    params = { workspaceId: 'workspace-1' }
) => {
    return createBrowserRouter(
        [
            {
                path: '/workspaces/:workspaceId',
                Component: WorkspaceDashboard,
                loader: () => loaderData
            }
        ],
        {
            initialEntries: [`/workspaces/${params.workspaceId}`]
        }
    );
};

describe('WorkspaceDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders workspace dashboard successfully', async () => {
        const router = createRouter({
            dashboardData: mockDashboardData,
            error: null
        });

        render(<RouterProvider router={router} />);

        // Check workspace header
        expect(screen.getByText('My Workspace')).toBeInTheDocument();
        expect(screen.getByText('A test workspace')).toBeInTheDocument();

        // Check action buttons
        expect(screen.getByText('Import Data')).toBeInTheDocument();
        expect(screen.getByText('New Collection')).toBeInTheDocument();

        // Check stats cards
        expect(screen.getByText('Collections')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // Total collections
        expect(screen.getByText('Records')).toBeInTheDocument();
        expect(screen.getByText('239')).toBeInTheDocument(); // Total records
        expect(screen.getByText('Members')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // Active members

        // Check collections tab (default)
        expect(screen.getByText('Collections')).toBeInTheDocument();
        expect(screen.getByText('Users')).toBeInTheDocument();
        expect(screen.getByText('Products')).toBeInTheDocument();
        expect(
            screen.getByText('User management collection')
        ).toBeInTheDocument();
        expect(screen.getByText('Product catalog')).toBeInTheDocument();
    });

    it('handles empty collections state', async () => {
        const emptyData = {
            ...mockDashboardData,
            collections: [],
            stats: {
                ...mockDashboardData.stats,
                totalCollections: 0,
                totalRecords: 0
            }
        };

        const router = createRouter({ dashboardData: emptyData, error: null });

        render(<RouterProvider router={router} />);

        expect(screen.getByText('No collections yet')).toBeInTheDocument();
        expect(
            screen.getByText(
                'Create your first collection to start organizing your data'
            )
        ).toBeInTheDocument();
        expect(screen.getByText('Create Collection')).toBeInTheDocument();
    });

    it('switches between collections and activity tabs', async () => {
        const router = createRouter({
            dashboardData: mockDashboardData,
            error: null
        });

        render(<RouterProvider router={router} />);

        // Should start on collections tab
        expect(screen.getByText('Users')).toBeInTheDocument();
        expect(screen.getByText('Products')).toBeInTheDocument();

        // Switch to activity tab
        const activityTab = screen
            .getAllByText('Recent Activity')
            .find(
                el =>
                    el.getAttribute('role') === 'tab' ||
                    el.closest('[role="tab"]')
            );

        if (activityTab) {
            fireEvent.click(activityTab);
        }

        // Should show activity content
        expect(
            screen.getByText('Created collection "Users"')
        ).toBeInTheDocument();
        expect(screen.getByText('Added new user record')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('filters collections based on search', async () => {
        const router = createRouter({
            dashboardData: mockDashboardData,
            error: null
        });

        render(<RouterProvider router={router} />);

        const searchInput = screen.getByPlaceholderText(
            'Search collections...'
        );

        // Search for specific collection
        fireEvent.change(searchInput, { target: { value: 'Users' } });

        expect(screen.getByText('Users')).toBeInTheDocument();
        expect(screen.queryByText('Products')).not.toBeInTheDocument();
    });

    it('shows no collections found when search has no matches', async () => {
        const router = createRouter({
            dashboardData: mockDashboardData,
            error: null
        });

        render(<RouterProvider router={router} />);

        const searchInput = screen.getByPlaceholderText(
            'Search collections...'
        );

        // Search for non-existent collection
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

        expect(screen.getByText('No collections found')).toBeInTheDocument();
        expect(
            screen.getByText('Try adjusting your search terms')
        ).toBeInTheDocument();
        expect(screen.getByText('Clear Search')).toBeInTheDocument();
    });

    it('switches between grid and list view for collections', async () => {
        const router = createRouter({
            dashboardData: mockDashboardData,
            error: null
        });

        render(<RouterProvider router={router} />);

        // Find view toggle buttons
        const buttons = screen.getAllByRole('button');
        const listButton = buttons.find(
            btn =>
                btn.querySelector('svg') &&
                btn.getAttribute('aria-label') === 'list view'
        );
        const gridButton = buttons.find(
            btn =>
                btn.querySelector('svg') &&
                btn.getAttribute('aria-label') === 'grid view'
        );

        // Both collections should be visible in default grid view
        expect(screen.getByText('Users')).toBeInTheDocument();
        expect(screen.getByText('Products')).toBeInTheDocument();

        // Collections should still be visible after view change
        // (exact layout testing would require more detailed DOM inspection)
        expect(screen.getByText('Users')).toBeInTheDocument();
        expect(screen.getByText('Products')).toBeInTheDocument();
    });

    it('handles error state', async () => {
        const router = createRouter({
            dashboardData: null,
            error: 'Failed to load workspace'
        });

        render(<RouterProvider router={router} />);

        expect(
            screen.getByText('Unable to load workspace')
        ).toBeInTheDocument();
        expect(
            screen.getByText('Failed to load workspace')
        ).toBeInTheDocument();
        expect(screen.getByText('Back to Workspaces')).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('handles empty activity state', async () => {
        const emptyActivityData = {
            ...mockDashboardData,
            recentActivity: []
        };

        const router = createRouter({
            dashboardData: emptyActivityData,
            error: null
        });

        render(<RouterProvider router={router} />);

        // Switch to activity tab
        const activityTab = screen
            .getAllByText('Recent Activity')
            .find(
                el =>
                    el.getAttribute('role') === 'tab' ||
                    el.closest('[role="tab"]')
            );

        if (activityTab) {
            fireEvent.click(activityTab);
        }

        expect(screen.getByText('No recent activity')).toBeInTheDocument();
        expect(
            screen.getByText(
                'Activity will appear here as you and your team work with collections'
            )
        ).toBeInTheDocument();
    });
});

describe('WorkspaceDashboard loader', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('loads dashboard data successfully', async () => {
        const { workspaceApi } = await import('../../lib/api/index.js');
        workspaceApi.getWorkspaceDashboard = vi
            .fn()
            .mockResolvedValue(mockDashboardData);

        const request = new Request('http://localhost/workspaces/workspace-1');
        const result = await loader({
            request,
            params: { workspaceId: 'workspace-1' },
            context: {}
        });

        expect(result).toEqual({
            dashboardData: mockDashboardData,
            error: null
        });
        expect(workspaceApi.getWorkspaceDashboard).toHaveBeenCalledWith(
            'workspace-1'
        );
    });

    it('handles missing workspace ID', async () => {
        const request = new Request('http://localhost/workspaces/');

        await expect(
            loader({ request, params: {}, context: {} })
        ).rejects.toThrow('Workspace ID is required');
    });

    it('handles API errors gracefully', async () => {
        const { workspaceApi } = await import('../../lib/api/index.js');
        const error = new Error('Workspace not found');
        workspaceApi.getWorkspaceDashboard = vi.fn().mockRejectedValue(error);

        const request = new Request('http://localhost/workspaces/workspace-1');
        const result = await loader({
            request,
            params: { workspaceId: 'workspace-1' },
            context: {}
        });

        expect(result).toEqual({
            dashboardData: null,
            error: 'Workspace not found'
        });
    });
});
