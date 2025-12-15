import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { type Auth, BETTER_AUTH_SERVICE } from './auth.service.js';

/**
 * User information returned from Better Auth
 */
export interface AuthUser {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    roles?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * UserService - Provides user lookup functionality via Better Auth API
 *
 * This service exposes user management operations through Better Auth's
 * admin plugin, decoupling other domains from the auth domain's internal
 * implementation details (e.g., Mongoose models).
 *
 * @example
 * ```typescript
 * // Find a user by email
 * const user = await userService.findByEmail('user@example.com');
 *
 * // Find a user by ID
 * const user = await userService.findById('user-id');
 *
 * // List users with pagination
 * const result = await userService.listUsers({ limit: 10, offset: 0 });
 * ```
 */
@Injectable()
export class UserService {
    constructor(
        @Inject(BETTER_AUTH_SERVICE)
        private readonly auth: Auth
    ) {}

    /**
     * Find a user by email address
     *
     * @param email - The email address to search for
     * @returns The user if found
     * @throws NotFoundException if user is not found
     */
    async findByEmail(email: string): Promise<AuthUser> {
        const result = await this.auth.api.listUsers({
            query: {
                filterField: 'email',
                filterValue: email,
                filterOperator: 'eq',
                limit: 1
            }
        });

        const user = result.users?.[0];
        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }

        return this.mapToAuthUser(user);
    }

    /**
     * Find a user by email address, returning null if not found
     *
     * @param email - The email address to search for
     * @returns The user if found, or null
     */
    async findByEmailOrNull(email: string): Promise<AuthUser | null> {
        try {
            return await this.findByEmail(email);
        } catch {
            return null;
        }
    }

    /**
     * Find a user by ID
     *
     * @param id - The user ID
     * @returns The user if found
     * @throws NotFoundException if user is not found
     */
    async findById(id: string): Promise<AuthUser> {
        // Use listUsers with filter as Better Auth doesn't expose a direct getUser endpoint
        const result = await this.auth.api.listUsers({
            query: {
                limit: 1000 // Need to search through users
            }
        });

        const user = result.users?.find(u => u.id === id);

        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }

        return this.mapToAuthUser(user);
    }

    /**
     * Find a user by ID, returning null if not found
     *
     * @param id - The user ID
     * @returns The user if found, or null
     */
    async findByIdOrNull(id: string): Promise<AuthUser | null> {
        try {
            return await this.findById(id);
        } catch {
            return null;
        }
    }

    /**
     * List users with pagination and optional search
     *
     * @param options - Pagination and search options
     * @returns Paginated list of users
     */
    async listUsers(
        options: {
            limit?: number;
            offset?: number;
            searchValue?: string;
            searchField?: 'email' | 'name';
            searchOperator?: 'contains' | 'starts_with' | 'ends_with';
            sortBy?: string;
            sortDirection?: 'asc' | 'desc';
        } = {}
    ): Promise<{
        users: AuthUser[];
        total: number;
        limit?: number;
        offset?: number;
    }> {
        const result = await this.auth.api.listUsers({
            query: {
                limit: options.limit ?? 100,
                offset: options.offset ?? 0,
                searchValue: options.searchValue,
                searchField: options.searchField,
                searchOperator: options.searchOperator,
                sortBy: options.sortBy,
                sortDirection: options.sortDirection
            }
        });

        return {
            users: (result.users ?? []).map(u => this.mapToAuthUser(u)),
            total: result.total ?? 0,
            limit: 'limit' in result ? result.limit : undefined,
            offset: 'offset' in result ? result.offset : undefined
        };
    }

    /**
     * Check if a user exists by email
     *
     * @param email - The email address to check
     * @returns True if user exists
     */
    async existsByEmail(email: string): Promise<boolean> {
        const user = await this.findByEmailOrNull(email);
        return user !== null;
    }

    /**
     * Check if a user exists by ID
     *
     * @param id - The user ID to check
     * @returns True if user exists
     */
    async existsById(id: string): Promise<boolean> {
        const user = await this.findByIdOrNull(id);
        return user !== null;
    }

    /**
     * Map Better Auth user response to AuthUser interface
     */
    private mapToAuthUser(user: {
        id: string;
        name: string;
        email: string;
        emailVerified: boolean;
        image?: string | null;
        role?: string;
        createdAt: Date;
        updatedAt: Date;
    }): AuthUser {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
            roles: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }
}
