/**
 * Hook for tracking recently accessed collections
 */
import { useState, useEffect, useCallback } from 'react';

const RECENT_COLLECTIONS_KEY = 'struktura_recent_collections';
const MAX_RECENT_ITEMS = 10;

export interface RecentCollection {
    id: string;
    name: string;
    slug: string;
    workspaceId: string;
    accessedAt: string;
}

export function useRecentCollections(workspaceId: string) {
    const [recentCollections, setRecentCollections] = useState<RecentCollection[]>([]);

    // Load recent collections from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(RECENT_COLLECTIONS_KEY);
        if (stored) {
            try {
                const allRecent: RecentCollection[] = JSON.parse(stored);
                const workspaceRecent = allRecent.filter(
                    (c) => c.workspaceId === workspaceId
                );
                setRecentCollections(workspaceRecent.slice(0, MAX_RECENT_ITEMS));
            } catch (err) {
                console.error('Failed to load recent collections:', err);
                setRecentCollections([]);
            }
        }
    }, [workspaceId]);

    // Add a collection to recent list
    const addRecentCollection = useCallback(
        (collection: Omit<RecentCollection, 'accessedAt'>) => {
            const stored = localStorage.getItem(RECENT_COLLECTIONS_KEY);
            let allRecent: RecentCollection[] = [];

            if (stored) {
                try {
                    allRecent = JSON.parse(stored);
                } catch (err) {
                    console.error('Failed to parse recent collections:', err);
                }
            }

            // Remove existing entry if it exists
            allRecent = allRecent.filter((c) => c.id !== collection.id);

            // Add to beginning
            allRecent.unshift({
                ...collection,
                accessedAt: new Date().toISOString()
            });

            // Keep only recent items per workspace
            const workspaceRecent = allRecent.filter(
                (c) => c.workspaceId === workspaceId
            );
            const otherWorkspaceRecent = allRecent.filter(
                (c) => c.workspaceId !== workspaceId
            );

            // Limit items
            const trimmedWorkspaceRecent = workspaceRecent.slice(0, MAX_RECENT_ITEMS);
            const trimmedOtherRecent = otherWorkspaceRecent.slice(
                0,
                MAX_RECENT_ITEMS * 3
            ); // Keep more from other workspaces

            const finalRecent = [...trimmedWorkspaceRecent, ...trimmedOtherRecent];

            localStorage.setItem(RECENT_COLLECTIONS_KEY, JSON.stringify(finalRecent));
            setRecentCollections(trimmedWorkspaceRecent);
        },
        [workspaceId]
    );

    // Clear all recent collections
    const clearRecentCollections = useCallback(() => {
        const stored = localStorage.getItem(RECENT_COLLECTIONS_KEY);
        if (stored) {
            try {
                const allRecent: RecentCollection[] = JSON.parse(stored);
                const otherWorkspaceRecent = allRecent.filter(
                    (c) => c.workspaceId !== workspaceId
                );
                localStorage.setItem(
                    RECENT_COLLECTIONS_KEY,
                    JSON.stringify(otherWorkspaceRecent)
                );
            } catch (err) {
                console.error('Failed to clear recent collections:', err);
            }
        }
        setRecentCollections([]);
    }, [workspaceId]);

    return {
        recentCollections,
        addRecentCollection,
        clearRecentCollections
    };
}
