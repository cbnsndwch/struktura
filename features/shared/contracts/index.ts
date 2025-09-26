/**
 * Shared contracts and interfaces for all Struktura features
 */

// Re-export common contracts from the global contracts library
export * from '@cbnsndwch/struktura-contracts';

// Base entity interfaces
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

// Common result types
export interface Result<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Pagination interfaces
export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Feature module interface
export interface FeatureModule {
    name: string;
    version: string;
    description: string;
}
