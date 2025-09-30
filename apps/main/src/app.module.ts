import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { JwtAuthGuard, RolesGuard } from '@cbnsndwch/struktura-auth-domain';

import { features } from './features/index.js';

@Module({
    imports: features,
    providers: [
        // Global guards
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard
        }
    ]
})
export class AppModule {}
