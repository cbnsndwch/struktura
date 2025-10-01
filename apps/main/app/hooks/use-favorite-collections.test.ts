/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFavoriteCollections } from './use-favorite-collections.js';

describe('useFavoriteCollections', () => {
    const workspaceId = 'workspace-1';
    const mockCollection = {
        id: 'col-1',
        name: 'Test Collection',
        slug: 'test-collection',
        workspaceId
    };

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should initialize with empty favorites', () => {
        const { result } = renderHook(() => useFavoriteCollections(workspaceId));

        expect(result.current.favoriteCollections).toEqual([]);
    });

    it('should add a collection to favorites', () => {
        const { result } = renderHook(() => useFavoriteCollections(workspaceId));

        act(() => {
            result.current.toggleFavorite(mockCollection);
        });

        expect(result.current.favoriteCollections).toHaveLength(1);
        expect(result.current.favoriteCollections[0].id).toBe(mockCollection.id);
        expect(result.current.isFavorite(mockCollection.id)).toBe(true);
    });

    it('should remove a collection from favorites', () => {
        const { result } = renderHook(() => useFavoriteCollections(workspaceId));

        act(() => {
            result.current.toggleFavorite(mockCollection);
        });

        expect(result.current.isFavorite(mockCollection.id)).toBe(true);

        act(() => {
            result.current.toggleFavorite(mockCollection);
        });

        expect(result.current.favoriteCollections).toHaveLength(0);
        expect(result.current.isFavorite(mockCollection.id)).toBe(false);
    });

    it('should persist favorites to localStorage', () => {
        const { result } = renderHook(() => useFavoriteCollections(workspaceId));

        act(() => {
            result.current.toggleFavorite(mockCollection);
        });

        const stored = localStorage.getItem('struktura_favorite_collections');
        expect(stored).toBeTruthy();

        const parsed = JSON.parse(stored!);
        expect(parsed).toHaveLength(1);
        expect(parsed[0].id).toBe(mockCollection.id);
    });

    it('should load favorites from localStorage', () => {
        // Pre-populate localStorage
        const favorites = [{ ...mockCollection, starredAt: new Date().toISOString() }];
        localStorage.setItem('struktura_favorite_collections', JSON.stringify(favorites));

        const { result } = renderHook(() => useFavoriteCollections(workspaceId));

        expect(result.current.favoriteCollections).toHaveLength(1);
        expect(result.current.isFavorite(mockCollection.id)).toBe(true);
    });

    it('should only show favorites for current workspace', () => {
        const otherWorkspaceId = 'workspace-2';
        const otherCollection = {
            id: 'col-2',
            name: 'Other Collection',
            slug: 'other',
            workspaceId: otherWorkspaceId
        };

        // Add favorites for different workspaces
        const favorites = [
            { ...mockCollection, starredAt: new Date().toISOString() },
            { ...otherCollection, starredAt: new Date().toISOString() }
        ];
        localStorage.setItem('struktura_favorite_collections', JSON.stringify(favorites));

        const { result } = renderHook(() => useFavoriteCollections(workspaceId));

        expect(result.current.favoriteCollections).toHaveLength(1);
        expect(result.current.favoriteCollections[0].id).toBe(mockCollection.id);
    });

    it('should clear all favorites for workspace', () => {
        const { result } = renderHook(() => useFavoriteCollections(workspaceId));

        act(() => {
            result.current.toggleFavorite(mockCollection);
        });

        expect(result.current.favoriteCollections).toHaveLength(1);

        act(() => {
            result.current.clearFavorites();
        });

        expect(result.current.favoriteCollections).toHaveLength(0);
    });
});
