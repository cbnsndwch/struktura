import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';

import { authControllers } from './controllers/index.js';
import { authEntities } from './entities/index.js';
import { BetterAuthGuard } from './guards/better-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { authServices } from './services/index.js';

/**
 * AuthModule - Authentication/Session domain module
 *
 * This module provides:
 * - BetterAuthGuard for protecting routes with @UseGuards()
 * - PreferencesController for app-specific user preferences (stored in BA's user collection)
 * - RolesGuard for role-based access control
 */
@Module({
    imports: [
        // Register User schema to enable populate() in other modules
        MongooseModule.forFeature(authEntities),
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
    controllers: authControllers,
    providers: [
        ...authServices,
        BetterAuthGuard,
        RolesGuard
        //
    ],
    exports: [
        ...authServices,
        BetterAuthGuard,
        RolesGuard,
        // Export MongooseModule so User is available in importing modules
        MongooseModule
    ]
})
export class AuthModule {}
