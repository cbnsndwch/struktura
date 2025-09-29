import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { User, UserPreferencesType } from '../entities/user.entity.js';
import {
    RegisterDto,
    LoginDto,
    UpdatePreferencesDto
} from '../dto/auth.dto.js';
import { AuthService } from '../services/auth.service.js';

/**
 * Example GraphQL resolver using the consolidated User model
 * This shows how the same User class works as both DTO validation and GraphQL schema
 */
@Resolver(() => User)
export class UserResolver {
    constructor(private authService: AuthService) {}

    /**
     * Get current user profile
     * Uses User class as GraphQL ObjectType
     */
    @Query(() => User)
    @UseGuards(JwtAuthGuard)
    async me(@CurrentUser() user: User): Promise<User> {
        // The User class automatically handles GraphQL field mapping
        return user;
    }

    /**
     * Register a new user
     * Uses RegisterDto (derived from User) for input validation
     * Returns User object for GraphQL response
     */
    @Mutation(() => User)
    async register(@Args('input') input: RegisterDto): Promise<User> {
        // RegisterDto provides validation, User provides GraphQL output schema
        // return this.authService.register(input);

        // Placeholder implementation
        const user = new User();
        user.email = input.email;
        user.name = input.name;
        user.isVerified = false;
        user.roles = ['editor'];
        user.createdAt = new Date();
        user.updatedAt = new Date();
        return user;
    }

    /**
     * User login
     * Uses LoginDto for input validation
     */
    @Mutation(() => String) // or create AuthResponse GraphQL type
    async login(@Args('input') input: LoginDto): Promise<string> {
        // LoginDto provides validation
        // return this.authService.login(input);

        // Placeholder implementation
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { email, password } = input;
        return 'jwt-token-here';
    }

    /**
     * Update user preferences
     */
    @Mutation(() => User)
    @UseGuards(JwtAuthGuard)
    async updatePreferences(
        @CurrentUser() user: User,
        @Args('input') input: UpdatePreferencesDto
    ): Promise<User> {
        return this.authService.updatePreferences(user.id, input);
    }

    /**
     * Get user preferences
     */
    @Query(() => UserPreferencesType, { nullable: true })
    @UseGuards(JwtAuthGuard)
    async preferences(
        @CurrentUser() user: User
    ): Promise<UserPreferencesType | null> {
        const prefs = await this.authService.getPreferences(user.id);
        return prefs ? { theme: prefs.theme } : null;
    }
}
