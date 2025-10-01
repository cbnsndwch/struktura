/**
 * Workspace navigation sidebar with collections list
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
    Plus,
    Search,
    Home,
    Database,
    Settings,
    Star,
    Clock,
    ChevronRight,
    MoreHorizontal
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuAction,
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Separator,
    ScrollArea
} from '@cbnsndwch/struktura-shared-ui';
import type { CollectionSummary } from '../lib/api/workspaces.js';
import type { RecentCollection } from '../hooks/use-recent-collections.js';
import type { FavoriteCollection } from '../hooks/use-favorite-collections.js';

interface WorkspaceNavigationProps {
    workspaceId: string;
    workspaceName: string;
    collections: CollectionSummary[];
    recentCollections: RecentCollection[];
    favoriteCollections: FavoriteCollection[];
    currentCollectionId?: string;
    onSearch: () => void;
    onToggleFavorite: (collection: Omit<FavoriteCollection, 'starredAt'>) => void;
    isFavorite: (collectionId: string) => boolean;
}

export function WorkspaceNavigation({
    workspaceId,
    workspaceName,
    collections,
    recentCollections,
    favoriteCollections,
    currentCollectionId,
    onSearch,
    onToggleFavorite,
    isFavorite
}: WorkspaceNavigationProps) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Filter collections based on search
    const filteredCollections = searchQuery
        ? collections.filter(
              (c) =>
                  c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.slug.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : collections;

    const handleCollectionClick = (collectionId: string) => {
        navigate(`/workspaces/${workspaceId}/collections/${collectionId}`);
    };

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                        >
                            <Link to={`/workspaces/${workspaceId}`}>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Database className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">{workspaceName}</span>
                                    <span className="text-xs text-muted-foreground">
                                        Workspace
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Quick Actions */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={onSearch}
                                    tooltip="Quick search (Ctrl+K)"
                                >
                                    <Search className="h-4 w-4" />
                                    <span>Search</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link to={`/workspaces/${workspaceId}`}>
                                        <Home className="h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <Separator />

                {/* Favorites */}
                {favoriteCollections.length > 0 && (
                    <>
                        <SidebarGroup>
                            <SidebarGroupLabel>Favorites</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {favoriteCollections.slice(0, 5).map((collection) => (
                                        <SidebarMenuItem key={collection.id}>
                                            <SidebarMenuButton
                                                onClick={() =>
                                                    handleCollectionClick(collection.id)
                                                }
                                                isActive={currentCollectionId === collection.id}
                                                tooltip={collection.name}
                                            >
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span>{collection.name}</span>
                                            </SidebarMenuButton>
                                            <SidebarMenuAction
                                                onClick={() =>
                                                    onToggleFavorite({
                                                        id: collection.id,
                                                        name: collection.name,
                                                        slug: collection.slug,
                                                        workspaceId: workspaceId
                                                    })
                                                }
                                            >
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            </SidebarMenuAction>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                        <Separator />
                    </>
                )}

                {/* Recent Collections */}
                {recentCollections.length > 0 && (
                    <>
                        <SidebarGroup>
                            <SidebarGroupLabel>Recent</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {recentCollections.slice(0, 5).map((collection) => (
                                        <SidebarMenuItem key={collection.id}>
                                            <SidebarMenuButton
                                                onClick={() =>
                                                    handleCollectionClick(collection.id)
                                                }
                                                isActive={currentCollectionId === collection.id}
                                                tooltip={collection.name}
                                            >
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span>{collection.name}</span>
                                            </SidebarMenuButton>
                                            <SidebarMenuAction
                                                onClick={() =>
                                                    onToggleFavorite({
                                                        id: collection.id,
                                                        name: collection.name,
                                                        slug: collection.slug,
                                                        workspaceId: workspaceId
                                                    })
                                                }
                                            >
                                                <Star
                                                    className={`h-4 w-4 ${
                                                        isFavorite(collection.id)
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                />
                                            </SidebarMenuAction>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                        <Separator />
                    </>
                )}

                {/* All Collections */}
                <SidebarGroup className="flex-1">
                    <SidebarGroupLabel>
                        <span>Collections</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-6 w-6 p-0"
                            onClick={() =>
                                navigate(`/workspaces/${workspaceId}/collections/new`)
                            }
                        >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">New Collection</span>
                        </Button>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        {/* Search input */}
                        <div className="px-2 py-1">
                            <SidebarInput
                                placeholder="Filter collections..."
                                value={searchQuery}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setSearchQuery(e.target.value)
                                }
                            />
                        </div>

                        <ScrollArea className="h-[400px]">
                            <SidebarMenu>
                                {filteredCollections.length === 0 ? (
                                    <div className="px-2 py-4 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            {searchQuery
                                                ? 'No collections found'
                                                : 'No collections yet'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredCollections.map((collection) => (
                                        <SidebarMenuItem key={collection.id}>
                                            <SidebarMenuButton
                                                onClick={() =>
                                                    handleCollectionClick(collection.id)
                                                }
                                                isActive={currentCollectionId === collection.id}
                                                tooltip={collection.name}
                                            >
                                                <Database className="h-4 w-4 text-muted-foreground" />
                                                <span>{collection.name}</span>
                                                <span className="ml-auto text-xs text-muted-foreground">
                                                    {collection.recordCount}
                                                </span>
                                            </SidebarMenuButton>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <SidebarMenuAction>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </SidebarMenuAction>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            onToggleFavorite({
                                                                id: collection.id,
                                                                name: collection.name,
                                                                slug: collection.slug,
                                                                workspaceId: workspaceId
                                                            })
                                                        }
                                                    >
                                                        <Star
                                                            className={`mr-2 h-4 w-4 ${
                                                                isFavorite(collection.id)
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : ''
                                                            }`}
                                                        />
                                                        {isFavorite(collection.id)
                                                            ? 'Remove from favorites'
                                                            : 'Add to favorites'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            navigate(
                                                                `/workspaces/${workspaceId}/collections/${collection.id}/settings`
                                                            )
                                                        }
                                                    >
                                                        <Settings className="mr-2 h-4 w-4" />
                                                        Collection settings
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </SidebarMenuItem>
                                    ))
                                )}
                            </SidebarMenu>
                        </ScrollArea>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link to={`/workspaces/${workspaceId}/settings`}>
                                <Settings className="h-4 w-4" />
                                <span>Workspace Settings</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
