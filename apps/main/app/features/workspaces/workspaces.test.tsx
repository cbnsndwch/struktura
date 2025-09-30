/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import WorkspacesPage, { loader } from './workspaces.js';

// Mock the auth utilities
vi.mock('../../lib/auth.js', () => ({
    requireAuth: vi.fn(),
    useAuthGuard: vi.fn(),
    isAuthenticated: vi.fn(() => true)
}));

// Mock the onboarding utilities
vi.mock('../../lib/onboarding.js', () => ({
    shouldShowOnboarding: vi.fn(() => false),
    startOnboarding: vi.fn(),
    shouldTriggerOnboardingForNewUser: vi.fn(() => false)
}));

// Mock the useLoaderData hook
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useLoaderData: vi.fn(),
        useNavigate: vi.fn(() => vi.fn()),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Link: ({ children, to, ...props }: any) => (
            <a href={to} {...props}>
                {children}
            </a>
        )
    };
});

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

describe('WorkspacesPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders workspaces list successfully', async () => {
        const { useLoaderData } = await import('react-router');
        vi.mocked(useLoaderData).mockReturnValue({
            workspaces: mockWorkspaces,
            error: null
        });

        render(
            <MemoryRouter>
                <WorkspacesPage />
            </MemoryRouter>
        );

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
        const { useLoaderData } = await import('react-router');
        vi.mocked(useLoaderData).mockReturnValue({
            workspaces: [],
            error: null
        });

        render(
            <MemoryRouter>
                <WorkspacesPage />
            </MemoryRouter>
        );

        expect(screen.getByText('No workspaces yet')).toBeInTheDocument();
        expect(
            screen.getByText(
                'Create your first workspace to get started with Struktura'
            )
        ).toBeInTheDocument();
        expect(screen.getByText('Create Workspace')).toBeInTheDocument();
    });

    it('handles error state', async () => {
        const { useLoaderData } = await import('react-router');
        vi.mocked(useLoaderData).mockReturnValue({
            workspaces: [],
            error: 'Failed to load workspaces'
        });

        render(
            <MemoryRouter>
                <WorkspacesPage />
            </MemoryRouter>
        );

        expect(
            screen.getByText('Unable to load workspaces')
        ).toBeInTheDocument();
        expect(
            screen.getByText('Failed to load workspaces')
        ).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('filters workspaces based on search query', async () => {
        const { useLoaderData } = await import('react-router');
        vi.mocked(useLoaderData).mockReturnValue({
            workspaces: mockWorkspaces,
            error: null
        });

        render(
            <MemoryRouter>
                <WorkspacesPage />
            </MemoryRouter>
        );

        const searchInput = screen.getByPlaceholderText('Search workspaces...');

        // Search for specific workspace
        fireEvent.change(searchInput, { target: { value: 'Team' } });

        expect(screen.getByText('Team Workspace')).toBeInTheDocument();
        expect(
            screen.queryByText('My First Workspace')
        ).not.toBeInTheDocument();
    });

    it('shows no results when search has no matches', async () => {
        const { useLoaderData } = await import('react-router');
        vi.mocked(useLoaderData).mockReturnValue({
            workspaces: mockWorkspaces,
            error: null
        });

        render(
            <MemoryRouter>
                <WorkspacesPage />
            </MemoryRouter>
        );

        const searchInput = screen.getByPlaceholderText('Search workspaces...');

        // Search for non-existent workspace
        fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

        expect(screen.getByText('No workspaces found')).toBeInTheDocument();
        expect(
            screen.getByText('Try adjusting your search terms')
        ).toBeInTheDocument();
        expect(screen.getByText('Clear Search')).toBeInTheDocument();
    });

    it('switches between grid and list view modes', async () => {
        const { useLoaderData } = await import('react-router');
        vi.mocked(useLoaderData).mockReturnValue({
            workspaces: mockWorkspaces,
            error: null
        });

        render(
            <MemoryRouter>
                <WorkspacesPage />
            </MemoryRouter>
        );

        // Find the view toggle buttons (they are in the "flex items-center gap-2" container)
        const buttons = screen.getAllByRole('button');

        // The view toggle buttons should be among the unnamed buttons
        // Look for buttons that contain SVG icons for grid and list
        const viewToggleButtons = buttons.filter(
            button =>
                button.className.includes('h-8') && // Smaller height for toggle buttons
                !button.textContent // No text content, just icons
        );

        // Should have at least 2 view toggle buttons
        expect(viewToggleButtons.length).toBeGreaterThanOrEqual(2);

        // Test that we can click on the first two toggle buttons without errors
        if (viewToggleButtons[0]) fireEvent.click(viewToggleButtons[0]);
        if (viewToggleButtons[1]) fireEvent.click(viewToggleButtons[1]);

        // Both workspaces should still be visible after toggling
        expect(screen.getByText('My First Workspace')).toBeInTheDocument();
        expect(screen.getByText('Team Workspace')).toBeInTheDocument();
    });
});

describe('Workspaces loader', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('loads workspaces successfully', async () => {
        const { workspaceApi } = await import('../../lib/api/index.js');
        workspaceApi.getUserWorkspaces = vi
            .fn()
            .mockResolvedValue(mockWorkspaces);

        const mockRequest = {
            url: 'http://localhost:3000/workspaces'
        } as Request;
        const result = await loader({
            request: mockRequest,
            params: {},
            context: {}
        });

        expect(result).toMatchObject({
            workspaces: mockWorkspaces,
            error: null
        });
    });

    it('handles API errors gracefully', async () => {
        const { workspaceApi } = await import('../../lib/api/index.js');
        const error = new Error('API Error');
        workspaceApi.getUserWorkspaces = vi.fn().mockRejectedValue(error);

        const mockRequest = {
            url: 'http://localhost:3000/workspaces'
        } as Request;
        const result = await loader({
            request: mockRequest,
            params: {},
            context: {}
        });

        expect(result).toMatchObject({
            workspaces: [],
            error: 'API Error'
        });
    });
});
