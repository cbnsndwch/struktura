import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { BetterAuthGuard, RolesGuard } from '@cbnsndwch/struktura-auth-domain';

import { features } from './features/index.js';

/**
 * AppModule - Root application module
 *
 * Global guards are applied to all routes:
 * - BetterAuthGuard: Primary auth guard using Better Auth sessions
 * - RolesGuard: Role-based access control
 *
 * Note: Routes marked with @Public() decorator bypass auth guards.
 */
@Module({
    imports: features,
    providers: [
        // Global guards
        {
            provide: APP_GUARD,
            useClass: BetterAuthGuard
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard
        }
    ]
})
export class AppModule {}
