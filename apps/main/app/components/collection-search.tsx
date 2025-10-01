/**
 * Quick search dialog for collections and records
 */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, Database, Star, Clock, FileText } from 'lucide-react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from '@cbnsndwch/struktura-shared-ui';

import type { CollectionSummary } from '../lib/api/workspaces.js';
import type { RecentCollection } from '../hooks/use-recent-collections.js';
import type { FavoriteCollection } from '../hooks/use-favorite-collections.js';

interface CollectionSearchProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string;
    collections: CollectionSummary[];
    recentCollections: RecentCollection[];
    favoriteCollections: FavoriteCollection[];
    onNavigate?: () => void;
}

export function CollectionSearch({
    open,
    onOpenChange,
    workspaceId,
    collections,
    recentCollections,
    favoriteCollections,
    onNavigate
}: CollectionSearchProps) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Filter collections based on search query
    const filteredCollections = useMemo(() => {
        if (!searchQuery) return collections;

        const query = searchQuery.toLowerCase();
        return collections.filter(
            c =>
                c.name.toLowerCase().includes(query) ||
                c.slug.toLowerCase().includes(query) ||
                c.description?.toLowerCase().includes(query)
        );
    }, [collections, searchQuery]);

    // Filter recent collections by search
    const filteredRecent = useMemo(() => {
        if (!searchQuery) return recentCollections;

        const query = searchQuery.toLowerCase();
        return recentCollections.filter(
            c =>
                c.name.toLowerCase().includes(query) ||
                c.slug.toLowerCase().includes(query)
        );
    }, [recentCollections, searchQuery]);

    // Filter favorites by search
    const filteredFavorites = useMemo(() => {
        if (!searchQuery) return favoriteCollections;

        const query = searchQuery.toLowerCase();
        return favoriteCollections.filter(
            c =>
                c.name.toLowerCase().includes(query) ||
                c.slug.toLowerCase().includes(query)
        );
    }, [favoriteCollections, searchQuery]);

    const handleSelect = (collectionId: string) => {
        navigate(`/workspaces/${workspaceId}/collections/${collectionId}`);
        onOpenChange(false);
        if (onNavigate) onNavigate();
    };

    // Reset search when dialog closes
    useEffect(() => {
        if (!open) {
            setSearchQuery('');
        }
    }, [open]);

    return (
        <CommandDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Search Collections"
            description="Quickly find and navigate to collections"
        >
            <CommandInput
                placeholder="Search collections..."
                value={searchQuery}
                onValueChange={setSearchQuery}
            />
            <CommandList>
                <CommandEmpty>
                    <div className="py-6 text-center">
                        <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                            No collections found
                        </p>
                    </div>
                </CommandEmpty>

                {!searchQuery && filteredFavorites.length > 0 && (
                    <>
                        <CommandGroup heading="Favorites">
                            {filteredFavorites.map(collection => (
                                <CommandItem
                                    key={collection.id}
                                    value={collection.id}
                                    onSelect={() => handleSelect(collection.id)}
                                >
                                    <Star className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span>{collection.name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                    </>
                )}

                {!searchQuery && filteredRecent.length > 0 && (
                    <>
                        <CommandGroup heading="Recent">
                            {filteredRecent.map(collection => (
                                <CommandItem
                                    key={collection.id}
                                    value={collection.id}
                                    onSelect={() => handleSelect(collection.id)}
                                >
                                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>{collection.name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                    </>
                )}

                {filteredCollections.length > 0 && (
                    <CommandGroup
                        heading={
                            searchQuery ? 'Search Results' : 'All Collections'
                        }
                    >
                        {filteredCollections.map(collection => (
                            <CommandItem
                                key={collection.id}
                                value={collection.id}
                                onSelect={() => handleSelect(collection.id)}
                            >
                                <Database className="mr-2 h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-col">
                                    <span>{collection.name}</span>
                                    {collection.description && (
                                        <span className="text-xs text-muted-foreground">
                                            {collection.description}
                                        </span>
                                    )}
                                </div>
                                <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                                    <FileText className="h-3 w-3" />
                                    {collection.recordCount}
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    );
}
