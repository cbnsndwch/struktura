import { Module } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import type { Connection } from 'mongoose';

import { PreferencesController } from './controllers/preferences.controller.js';
import {
    PreferencesService,
    MONGODB_DATABASE
} from './services/preferences.service.js';

// Guards
import { BetterAuthGuard } from './guards/better-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

/**
 * AuthModule - Authentication domain module
 *
 * Better Auth handles core authentication at the Express level (mounted in main.ts):
 * - POST /api/auth/sign-up/email - User registration
 * - POST /api/auth/sign-in/email - User login
 * - POST /api/auth/sign-out - User logout
 * - POST /api/auth/request-password-reset - Password reset request
 * - POST /api/auth/reset-password - Password reset
 * - GET /api/auth/session - Get current session
 * - GET /api/auth/token - Get JWT token (with jwt plugin)
 * - GET /api/auth/jwks - Get JWKS public keys
 *
 * This module provides:
 * - BetterAuthGuard for protecting routes with @UseGuards()
 * - PreferencesController for app-specific user preferences (stored in BA's user collection)
 * - RolesGuard for role-based access control
 */
@Module({
    imports: [
        // Rate limiting
        ThrottlerModule.forRoot([
            {
                name: 'short',
                ttl: 1000, // 1 second
                limit: 3 // 3 requests per second
            },
            {
                name: 'medium',
                ttl: 60000, // 1 minute
                limit: 20 // 20 requests per minute
            }
        ])
    ],
    controllers: [PreferencesController],
    providers: [
        // Provide MongoDB database instance from Mongoose connection
        // This is used by PreferencesService to access the ba_user collection
        {
            provide: MONGODB_DATABASE,
            useFactory: (connection: Connection) => {
                return connection.getClient().db();
            },
            inject: [getConnectionToken()]
        },
        PreferencesService,
        BetterAuthGuard,
        RolesGuard
    ],
    exports: [PreferencesService, BetterAuthGuard, RolesGuard]
})
export class AuthModule {}
