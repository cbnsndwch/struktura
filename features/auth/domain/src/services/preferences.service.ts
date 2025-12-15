import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import type {
    IUser,
    IUserPreferences
} from '@cbnsndwch/struktura-auth-contracts';

import { UpdatePreferencesDto } from '../dto/index.js';
import { User, type UserDocument } from '../entities/index.js';
import { parseUserPreferences } from '../entities/user-preferences.entity.js';

/**
 * Preferences Service
 *
 * Handles user preferences stored as additional fields in Better Auth's user model.
 * Uses the Better Auth database (ba_user collection) for all user data operations.
 */
@Injectable()
export class PreferencesService {
    constructor(
        @InjectModel(User.name)
        private readonly users: Model<UserDocument>
    ) {}

    /**
     * Update user preferences in Better Auth's user collection
     */
    async updatePreferences(
        userId: string,
        input: UpdatePreferencesDto
    ): Promise<IUser> {
        // First, get the current user to merge preferences
        const user = await this.users.findOne({ _id: userId });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        // Parse current preferences
        const currentPreferences = parseUserPreferences(user.preferences);

        // Merge with updates
        const updatedPreferences: IUserPreferences = {
            ...currentPreferences,
            ...(input.theme !== undefined ? { theme: input.theme } : {}),
            ...(input.notifications !== undefined
                ? {
                      notifications: {
                          ...currentPreferences.notifications,
                          ...input.notifications
                      }
                  }
                : {})
        };

        // Update user in Better Auth's collection
        const result = await this.users.findOneAndUpdate(
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

        return this.toDto(result);
    }

    /**
     * Get user preferences from Better Auth's user collection
     */
    async getPreferences(userId: string): Promise<IUserPreferences> {
        const user = await this.users.findOne({ _id: userId });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        return parseUserPreferences(user.preferences);
    }

    /**
     * Get full user data from Better Auth's user collection
     */
    async getUser(userId: string): Promise<IUser> {
        const user = await this.users.findOne({ _id: userId });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        return this.toDto(user);
    }

    //#region Private Helpers

    /**
     * Map a Better Auth user document to a front-end User with Preferences contract
     */
    private toDto(doc: UserDocument): IUser {
        return {
            id: doc._id.toString(),
            email: doc.email,
            name: doc.name,
            emailVerified: doc.emailVerified,
            roles: doc.roles,
            preferences: parseUserPreferences(doc.preferences),
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        };
    }

    //#endregion Private Helpers
}
