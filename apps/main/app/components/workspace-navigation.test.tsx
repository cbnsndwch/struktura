/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { WorkspaceNavigation } from './workspace-navigation.js';
import type { CollectionSummary } from '../lib/api/workspaces.js';

// Mock react-router
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: vi.fn(() => vi.fn()),
        Link: ({ children, to, ...props }: any) => (
            <a href={to} {...props}>
                {children}
            </a>
        )
    };
});

const mockCollections: CollectionSummary[] = [
    {
        id: 'col-1',
        name: 'Products',
        slug: 'products',
        description: 'Product catalog',
        recordCount: 150,
        lastUpdated: '2025-01-01T00:00:00Z'
    },
    {
        id: 'col-2',
        name: 'Orders',
        slug: 'orders',
        description: 'Customer orders',
        recordCount: 500,
        lastUpdated: '2025-01-01T00:00:00Z'
    }
];

describe('WorkspaceNavigation', () => {
    const defaultProps = {
        workspaceId: 'workspace-1',
        workspaceName: 'Test Workspace',
        collections: mockCollections,
        recentCollections: [],
        favoriteCollections: [],
        onSearch: vi.fn(),
        onToggleFavorite: vi.fn(),
        isFavorite: vi.fn(() => false)
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render workspace name', () => {
        render(
            <MemoryRouter>
                <WorkspaceNavigation {...defaultProps} />
            </MemoryRouter>
        );

        expect(screen.getByText('Test Workspace')).toBeInTheDocument();
    });

    it('should render all collections', () => {
        render(
            <MemoryRouter>
                <WorkspaceNavigation {...defaultProps} />
            </MemoryRouter>
        );

        expect(screen.getByText('Products')).toBeInTheDocument();
        expect(screen.getByText('Orders')).toBeInTheDocument();
    });

    it('should call onSearch when search button is clicked', () => {
        render(
            <MemoryRouter>
                <WorkspaceNavigation {...defaultProps} />
            </MemoryRouter>
        );

        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        expect(defaultProps.onSearch).toHaveBeenCalled();
    });

    it('should filter collections by search query', () => {
        render(
            <MemoryRouter>
                <WorkspaceNavigation {...defaultProps} />
            </MemoryRouter>
        );

        const searchInput = screen.getByPlaceholderText('Filter collections...');
        fireEvent.change(searchInput, { target: { value: 'prod' } });

        expect(screen.getByText('Products')).toBeInTheDocument();
        expect(screen.queryByText('Orders')).not.toBeInTheDocument();
    });

    it('should render favorites section when favorites exist', () => {
        const props = {
            ...defaultProps,
            favoriteCollections: [
                {
                    id: 'col-1',
                    name: 'Products',
                    slug: 'products',
                    workspaceId: 'workspace-1',
                    starredAt: '2025-01-01T00:00:00Z'
                }
            ]
        };

        render(
            <MemoryRouter>
                <WorkspaceNavigation {...props} />
            </MemoryRouter>
        );

        expect(screen.getByText('Favorites')).toBeInTheDocument();
    });

    it('should render recent collections section when recents exist', () => {
        const props = {
            ...defaultProps,
            recentCollections: [
                {
                    id: 'col-2',
                    name: 'Orders',
                    slug: 'orders',
                    workspaceId: 'workspace-1',
                    accessedAt: '2025-01-01T00:00:00Z'
                }
            ]
        };

        render(
            <MemoryRouter>
                <WorkspaceNavigation {...props} />
            </MemoryRouter>
        );

        expect(screen.getByText('Recent')).toBeInTheDocument();
    });
});
