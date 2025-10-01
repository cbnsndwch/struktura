/**
 * Workspace layout with navigation sidebar and content area
 */
import { useState } from 'react';
import { Outlet } from 'react-router';
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger
} from '@cbnsndwch/struktura-shared-ui';
import { WorkspaceNavigation } from './workspace-navigation.js';
import { WorkspaceBreadcrumbs, type BreadcrumbSegment } from './workspace-breadcrumbs.js';
import { CollectionSearch } from './collection-search.js';
import { useKeyboardShortcuts } from '../hooks/use-keyboard-shortcuts.js';
import { useRecentCollections } from '../hooks/use-recent-collections.js';
import { useFavoriteCollections } from '../hooks/use-favorite-collections.js';
import type { CollectionSummary } from '../lib/api/workspaces.js';

interface WorkspaceLayoutProps {
    workspaceId: string;
    workspaceName: string;
    collections: CollectionSummary[];
    currentCollectionId?: string;
    breadcrumbSegments?: BreadcrumbSegment[];
    children?: React.ReactNode;
}

export function WorkspaceLayout({
    workspaceId,
    workspaceName,
    collections,
    currentCollectionId,
    breadcrumbSegments = [],
    children
}: WorkspaceLayoutProps) {
    const [searchOpen, setSearchOpen] = useState(false);

    // Hooks for managing favorites and recents
    const { recentCollections, addRecentCollection } =
        useRecentCollections(workspaceId);
    const { favoriteCollections, isFavorite, toggleFavorite } =
        useFavoriteCollections(workspaceId);

    // Keyboard shortcuts
    useKeyboardShortcuts([
        {
            key: 'k',
            ctrlOrCmd: true,
            handler: () => setSearchOpen(true),
            description: 'Open quick search'
        }
    ]);

    return (
        <SidebarProvider>
            <WorkspaceNavigation
                workspaceId={workspaceId}
                workspaceName={workspaceName}
                collections={collections}
                recentCollections={recentCollections}
                favoriteCollections={favoriteCollections}
                currentCollectionId={currentCollectionId}
                onSearch={() => setSearchOpen(true)}
                onToggleFavorite={toggleFavorite}
                isFavorite={isFavorite}
            />

            <SidebarInset>
                {/* Header with breadcrumbs */}
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex-1">
                        <WorkspaceBreadcrumbs
                            workspaceId={workspaceId}
                            workspaceName={workspaceName}
                            segments={breadcrumbSegments}
                        />
                    </div>
                </header>

                {/* Main content */}
                <div className="flex flex-1 flex-col gap-4 p-4">
                    {children || <Outlet />}
                </div>
            </SidebarInset>

            {/* Search dialog */}
            <CollectionSearch
                open={searchOpen}
                onOpenChange={setSearchOpen}
                workspaceId={workspaceId}
                collections={collections}
                recentCollections={recentCollections}
                favoriteCollections={favoriteCollections}
                onNavigate={() => {
                    // Track navigation in recents
                    setSearchOpen(false);
                }}
            />
        </SidebarProvider>
    );
}
