/**
 * Preferences Service
 *
 * Handles user preferences stored as additional fields in Better Auth's user model.
 * Uses the Better Auth database (ba_user collection) for all user data operations.
 */
import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import type { Db } from 'mongodb';

import type { UserPreferences } from '@cbnsndwch/struktura-auth-contracts';

import { UpdatePreferencesDto } from '../dto/index.js';

/**
 * Default user preferences
 */
const DEFAULT_PREFERENCES: UserPreferences = { theme: 'system' };

/**
 * Parse preferences from JSON string stored in Better Auth
 */
function parsePreferences(
    preferencesJson: string | null | undefined
): UserPreferences {
    if (!preferencesJson) {
        return DEFAULT_PREFERENCES;
    }
    try {
        return JSON.parse(preferencesJson) as UserPreferences;
    } catch {
        return DEFAULT_PREFERENCES;
    }
}

/**
 * Better Auth user document shape
 */
interface BetterAuthUserDocument {
    _id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
    roles?: string;
    preferences?: string;
}

/**
 * User data returned from preferences operations
 */
export interface PreferencesUser {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    roles?: string;
    preferences: UserPreferences;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Injection token for MongoDB database instance
 */
export const MONGODB_DATABASE = 'MONGODB_DATABASE';

@Injectable()
export class PreferencesService {
    constructor(@Inject(MONGODB_DATABASE) private readonly db: Db) {}

    /**
     * Get the Better Auth users collection
     */
    private get usersCollection() {
        return this.db.collection<BetterAuthUserDocument>('ba_user');
    }

    /**
     * Update user preferences in Better Auth's user collection
     */
    async updatePreferences(
        userId: string,
        dto: UpdatePreferencesDto
    ): Promise<PreferencesUser> {
        // First, get the current user to merge preferences
        const currentUser = await this.usersCollection.findOne({ _id: userId });

        if (!currentUser) {
            throw new BadRequestException('User not found');
        }

        // Parse current preferences
        const currentPreferences = parsePreferences(currentUser.preferences);

        // Merge with updates
        const updatedPreferences: UserPreferences = {
            ...currentPreferences,
            ...(dto.theme !== undefined ? { theme: dto.theme } : {})
        };

        // Update user in Better Auth's collection
        const result = await this.usersCollection.findOneAndUpdate(
            { _id: userId },
            {
                $set: {
                    preferences: JSON.stringify(updatedPreferences),
                    updatedAt: new Date()
                }
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            throw new BadRequestException('Failed to update user preferences');
        }

        return this.mapToPreferencesUser(result);
    }

    /**
     * Get user preferences from Better Auth's user collection
     */
    async getPreferences(userId: string): Promise<UserPreferences> {
        const user = await this.usersCollection.findOne({ _id: userId });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        return parsePreferences(user.preferences);
    }

    /**
     * Get full user data from Better Auth's user collection
     */
    async getUser(userId: string): Promise<PreferencesUser> {
        const user = await this.usersCollection.findOne({ _id: userId });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        return this.mapToPreferencesUser(user);
    }

    /**
     * Map a Better Auth user document to PreferencesUser
     */
    private mapToPreferencesUser(doc: BetterAuthUserDocument): PreferencesUser {
        return {
            id: doc._id,
            email: doc.email,
            name: doc.name,
            emailVerified: doc.emailVerified,
            roles: doc.roles,
            preferences: parsePreferences(doc.preferences),
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        };
    }
}
