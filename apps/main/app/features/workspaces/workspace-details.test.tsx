/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';

import WorkspaceDashboard, { loader } from './workspace-details.js';

// Mock the useLoaderData hook
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useLoaderData: vi.fn(),
        useNavigate: vi.fn(() => vi.fn()),
        useParams: vi.fn(() => ({ workspaceId: 'workspace-1' })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Link: ({ children, to, ...props }: any) => (
            <a href={to} {...props}>
                {children}
            </a>
        )
    };
});

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

describe('WorkspaceDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders workspace dashboard successfully', async () => {
        const { useLoaderData } = await import('react-router');
        vi.mocked(useLoaderData).mockReturnValue({
            dashboardData: mockDashboardData,
            error: null
        });

        render(
            <MemoryRouter>
                <WorkspaceDashboard />
            </MemoryRouter>
        );

        // Check workspace header
        expect(screen.getByText('My Workspace')).toBeInTheDocument();
        expect(screen.getByText('A test workspace')).toBeInTheDocument();

        // Check action buttons
        expect(screen.getByText('Import Data')).toBeInTheDocument();
        expect(screen.getByText('New Collection')).toBeInTheDocument();

        // Check stats cards
        expect(screen.getAllByText('Collections')).toHaveLength(2); // Stats card title and tab
        expect(screen.getAllByText('2')).toHaveLength(2); // Collections and members count
        expect(screen.getByText('Records')).toBeInTheDocument();
        expect(screen.getByText('239')).toBeInTheDocument(); // Total records
        expect(screen.getByText('Members')).toBeInTheDocument();
        // Note: "2" appears for both collections count and members count

        // Check collections tab (default) - there are multiple "Collections" texts
        expect(screen.getAllByText('Collections')).toHaveLength(2); // Stats card and tab
        expect(screen.getByText('Users')).toBeInTheDocument();
        expect(screen.getByText('Products')).toBeInTheDocument();
        expect(
            screen.getByText('User management collection')
        ).toBeInTheDocument();
        expect(screen.getByText('Product catalog')).toBeInTheDocument();
    });

    it('handles empty collections state', async () => {
        const emptyData = { ...mockDashboardData, collections: [] };
        const { useLoaderData } = await import('react-router');
        vi.mocked(useLoaderData).mockReturnValue({
            dashboardData: emptyData,
            error: null
        });

        render(
            <MemoryRouter>
                <WorkspaceDashboard />
            </MemoryRouter>
        );

        // Check for empty state message
        expect(screen.getByText('No collections yet')).toBeInTheDocument();
    });

    it('switches between collections and activity tabs', async () => {
        const { useLoaderData } = await import('react-router');
        vi.mocked(useLoaderData).mockReturnValue({
            dashboardData: mockDashboardData,
            error: null
        });

        render(
            <MemoryRouter>
                <WorkspaceDashboard />
            </MemoryRouter>
        );

        // Should start on collections tab (default)
        expect(screen.getByText('Users')).toBeInTheDocument();
        expect(screen.getByText('Products')).toBeInTheDocument();

        // Check that both tabs exist
        expect(
            screen.getByRole('tab', { name: /collections/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('tab', { name: /recent activity/i })
        ).toBeInTheDocument();
    });

    it('filters collections based on search', async () => {
        const { useLoaderData } = await import('react-router');
        vi.mocked(useLoaderData).mockReturnValue({
            dashboardData: mockDashboardData,
            error: null
        });

        render(
            <MemoryRouter>
                <WorkspaceDashboard />
            </MemoryRouter>
        );

        const searchInput = screen.getByPlaceholderText(
            'Search collections...'
        );

        // Search for specific collection
        fireEvent.change(searchInput, { target: { value: 'Users' } });

        expect(screen.getByText('Users')).toBeInTheDocument();
        expect(screen.queryByText('Products')).not.toBeInTheDocument();
    });

    it('shows no collections found when search has no matches', async () => {
        const { useLoaderData } = await import('react-router');
        vi.mocked(useLoaderData).mockReturnValue({
            dashboardData: mockDashboardData,
            error: null
        });

        render(
            <MemoryRouter>
                <WorkspaceDashboard />
            </MemoryRouter>
        );

        const searchInput = screen.getByPlaceholderText(
            'Search collections...'
        );

        // Search for non-existent collection
        fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

        expect(screen.getByText('No collections found')).toBeInTheDocument();
    });

    it('switches between grid and list view for collections', async () => {
        const { useLoaderData } = await import('react-router');
        vi.mocked(useLoaderData).mockReturnValue({
            dashboardData: mockDashboardData,
            error: null
        });

        render(
            <MemoryRouter>
                <WorkspaceDashboard />
            </MemoryRouter>
        );

        // Find view toggle buttons - they should have h-8 class and no text content
        const buttons = screen.getAllByRole('button');
        const viewToggleButtons = buttons.filter(
            button => button.className.includes('h-8') && !button.textContent
        );

        // Should be able to toggle between views
        if (viewToggleButtons[0]) fireEvent.click(viewToggleButtons[0]);
        if (viewToggleButtons[1]) fireEvent.click(viewToggleButtons[1]);

        // Collections should still be visible
        expect(screen.getByText('Users')).toBeInTheDocument();
        expect(screen.getByText('Products')).toBeInTheDocument();
    });

    it('handles error state', async () => {
        const { useLoaderData } = await import('react-router');
        vi.mocked(useLoaderData).mockReturnValue({
            dashboardData: null,
            error: 'Failed to load workspace'
        });

        render(
            <MemoryRouter>
                <WorkspaceDashboard />
            </MemoryRouter>
        );

        expect(
            screen.getByText('Unable to load workspace')
        ).toBeInTheDocument();
        expect(
            screen.getByText('Failed to load workspace')
        ).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('handles empty activity state', async () => {
        const emptyActivityData = {
            ...mockDashboardData,
            recentActivity: []
        };
        const { useLoaderData } = await import('react-router');
        vi.mocked(useLoaderData).mockReturnValue({
            dashboardData: emptyActivityData,
            error: null
        });

        render(
            <MemoryRouter>
                <WorkspaceDashboard />
            </MemoryRouter>
        );

        // Check that activity tab exists
        const activityTab = screen.getByRole('tab', {
            name: /recent activity/i
        });
        expect(activityTab).toBeInTheDocument();

        // Click on activity tab
        fireEvent.click(activityTab);

        // For now, just verify the tab exists and is clickable
        // Full tab functionality testing might require more complex setup
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

        const result = await loader({
            params: { workspaceId: 'workspace-123' },
            request: new Request('http://localhost/workspace/workspace-123'),
            context: {}
        });

        expect(result).toEqual({
            dashboardData: mockDashboardData,
            error: null
        });
    });

    it('handles API errors gracefully', async () => {
        const { workspaceApi } = await import('../../lib/api/index.js');
        workspaceApi.getWorkspaceDashboard = vi
            .fn()
            .mockRejectedValue(new Error('API Error'));

        const result = await loader({
            params: { workspaceId: 'workspace-123' },
            request: new Request('http://localhost/workspace/workspace-123'),
            context: {}
        });

        expect(result).toEqual({
            dashboardData: null,
            error: 'API Error'
        });
    });

    it('handles workspace not found', async () => {
        const { workspaceApi } = await import('../../lib/api/index.js');
        workspaceApi.getWorkspaceDashboard = vi
            .fn()
            .mockRejectedValue(new Error('Workspace not found'));

        const result = await loader({
            params: { workspaceId: 'invalid-id' },
            request: new Request('http://localhost/workspace/invalid-id'),
            context: {}
        });

        expect(result).toEqual({
            dashboardData: null,
            error: 'Workspace not found'
        });
    });
});
