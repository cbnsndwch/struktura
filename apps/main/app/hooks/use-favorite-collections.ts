/**
 * Hook for managing favorite/starred collections
 */
import { useState, useEffect, useCallback } from 'react';

const FAVORITE_COLLECTIONS_KEY = 'struktura_favorite_collections';

export interface FavoriteCollection {
    id: string;
    name: string;
    slug: string;
    workspaceId: string;
    starredAt: string;
}

export function useFavoriteCollections(workspaceId: string) {
    const [favoriteCollections, setFavoriteCollections] = useState<
        FavoriteCollection[]
    >([]);

    // Load favorites from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(FAVORITE_COLLECTIONS_KEY);
        if (stored) {
            try {
                const allFavorites: FavoriteCollection[] = JSON.parse(stored);
                const workspaceFavorites = allFavorites.filter(
                    c => c.workspaceId === workspaceId
                );
                setFavoriteCollections(workspaceFavorites);
            } catch (err) {
                console.error('Failed to load favorite collections:', err);
                setFavoriteCollections([]);
            }
        }
    }, [workspaceId]);

    // Check if a collection is favorited
    const isFavorite = useCallback(
        (collectionId: string): boolean => {
            return favoriteCollections.some(c => c.id === collectionId);
        },
        [favoriteCollections]
    );

    // Toggle favorite status
    const toggleFavorite = useCallback(
        (collection: Omit<FavoriteCollection, 'starredAt'>) => {
            const stored = localStorage.getItem(FAVORITE_COLLECTIONS_KEY);
            let allFavorites: FavoriteCollection[] = [];

            if (stored) {
                try {
                    allFavorites = JSON.parse(stored);
                } catch (err) {
                    console.error('Failed to parse favorite collections:', err);
                }
            }

            const existingIndex = allFavorites.findIndex(
                c => c.id === collection.id
            );

            if (existingIndex >= 0) {
                // Remove from favorites
                allFavorites.splice(existingIndex, 1);
            } else {
                // Add to favorites
                allFavorites.push({
                    ...collection,
                    starredAt: new Date().toISOString()
                });
            }

            localStorage.setItem(
                FAVORITE_COLLECTIONS_KEY,
                JSON.stringify(allFavorites)
            );

            const workspaceFavorites = allFavorites.filter(
                c => c.workspaceId === workspaceId
            );
            setFavoriteCollections(workspaceFavorites);
        },
        [workspaceId]
    );

    // Clear all favorites for this workspace
    const clearFavorites = useCallback(() => {
        const stored = localStorage.getItem(FAVORITE_COLLECTIONS_KEY);
        if (stored) {
            try {
                const allFavorites: FavoriteCollection[] = JSON.parse(stored);
                const otherWorkspaceFavorites = allFavorites.filter(
                    c => c.workspaceId !== workspaceId
                );
                localStorage.setItem(
                    FAVORITE_COLLECTIONS_KEY,
                    JSON.stringify(otherWorkspaceFavorites)
                );
            } catch (err) {
                console.error('Failed to clear favorites:', err);
            }
        }
        setFavoriteCollections([]);
    }, [workspaceId]);

    return {
        favoriteCollections,
        isFavorite,
        toggleFavorite,
        clearFavorites
    };
}
