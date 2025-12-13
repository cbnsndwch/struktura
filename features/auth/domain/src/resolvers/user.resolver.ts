import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { BetterAuthGuard, type BetterAuthUser } from '../guards/better-auth.guard.js';
import { BetterAuthCurrentUser } from '../decorators/better-auth-user.decorator.js';
import { UserPreferencesType } from '../entities/user.entity.js';
import { UpdatePreferencesDto } from '../dto/index.js';
import { PreferencesService, type PreferencesUser } from '../services/preferences.service.js';

/**
 * GraphQL ObjectType for User (Better Auth compatible)
 * Using a simplified type that matches BA user structure
 */
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('User', { description: 'User account information from Better Auth' })
export class UserType {
    @Field(() => ID)
    id!: string;

    @Field()
    email!: string;

    @Field()
    name!: string;

    @Field()
    emailVerified!: boolean;

    @Field(() => [String], { nullable: true })
    roles?: string[];

    @Field(() => UserPreferencesType, { nullable: true })
    preferences?: UserPreferencesType;

    @Field()
    createdAt!: Date;

    @Field()
    updatedAt!: Date;
}

/**
 * Convert PreferencesUser to UserType for GraphQL
 */
function toUserType(user: PreferencesUser): UserType {
    const userType = new UserType();
    userType.id = user.id;
    userType.email = user.email;
    userType.name = user.name;
    userType.emailVerified = user.emailVerified;
    userType.roles = user.roles ? user.roles.split(',').map((r) => r.trim()) : undefined;
    userType.preferences = user.preferences;
    userType.createdAt = user.createdAt;
    userType.updatedAt = user.updatedAt;
    return userType;
}

/**
 * User GraphQL resolver for Better Auth
 *
 * Authentication (register, login, logout) is handled by Better Auth at the Express level.
 * This resolver provides GraphQL access to user data and preferences.
 */
@Resolver(() => UserType)
export class UserResolver {
    constructor(private preferencesService: PreferencesService) {}

    /**
     * Get current user profile
     */
    @Query(() => UserType)
    @UseGuards(BetterAuthGuard)
    async me(@BetterAuthCurrentUser() user: BetterAuthUser): Promise<UserType> {
        // Fetch full user with preferences from BA collection
        const fullUser = await this.preferencesService.getUser(user.id);
        return toUserType(fullUser);
    }

    /**
     * Update user preferences
     */
    @Mutation(() => UserType)
    @UseGuards(BetterAuthGuard)
    async updatePreferences(
        @BetterAuthCurrentUser() user: BetterAuthUser,
        @Args('input') input: UpdatePreferencesDto
    ): Promise<UserType> {
        const updatedUser = await this.preferencesService.updatePreferences(user.id, input);
        return toUserType(updatedUser);
    }

    /**
     * Get user preferences only
     */
    @Query(() => UserPreferencesType, { nullable: true })
    @UseGuards(BetterAuthGuard)
    async preferences(
        @BetterAuthCurrentUser() user: BetterAuthUser
    ): Promise<UserPreferencesType | null> {
        const prefs = await this.preferencesService.getPreferences(user.id);
        return prefs ? { theme: prefs.theme } : null;
    }
}
