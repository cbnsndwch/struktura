import { type DynamicModule, Module, type Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';

import {
    AUTH_MODULE_OPTIONS,
    AUTH_MODULE_DEFAULTS,
    type AuthModuleOptions,
    type AuthModuleAsyncOptions,
    type AuthOptionsFactory
} from './auth.options.js';
import { authControllers } from './controllers/index.js';
import { authEntities } from './entities/index.js';
import { BetterAuthGuard } from './guards/better-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import {
    authProvider,
    createMongodbAdapterConfigProvider
} from './services/auth.service.js';
import { NestJSMongoDBAdapterService } from './services/mongoose-nestjs.adapter.js';
import { PreferencesService } from './services/preferences.service.js';
import { SessionService } from './services/session.service.js';
import { UserService } from './services/user.service.js';

/**
 * AuthModule - Authentication/Session domain module
 *
 * This module provides:
 * - BetterAuthGuard for protecting routes with @UseGuards()
 * - PreferencesController for app-specific user preferences
 * - RolesGuard for role-based access control
 *
 * @example
 * ```typescript
 * // Basic usage with defaults
 * @Module({
 *   imports: [AuthModule.forRoot()]
 * })
 * export class AppModule {}
 *
 * // With custom options
 * @Module({
 *   imports: [
 *     AuthModule.forRoot({
 *       basePath: '/auth',
 *       secret: 'my-secret-key',
 *       session: { expiresIn: 60 * 60 * 24 * 30 }, // 30 days
 *       jwt: { expirationTime: '1h' }
 *     })
 *   ]
 * })
 * export class AppModule {}
 *
 * // Async configuration
 * @Module({
 *   imports: [
 *     AuthModule.forRootAsync({
 *       imports: [ConfigModule],
 *       useFactory: (config: ConfigService) => ({
 *         secret: config.get('AUTH_SECRET'),
 *         basePath: config.get('AUTH_BASE_PATH')
 *       }),
 *       inject: [ConfigService]
 *     })
 *   ]
 * })
 * export class AppModule {}
 * ```
 */
@Module({})
export class AuthModule {
    /**
     * Configure the AuthModule with static options
     */
    static forRoot(options: AuthModuleOptions = {}): DynamicModule {
        const rateLimits =
            options.rateLimits ?? AUTH_MODULE_DEFAULTS.rateLimits;

        return {
            module: AuthModule,
            global: true, // Make auth providers available globally
            imports: [
                MongooseModule.forFeature(authEntities),
                ThrottlerModule.forRoot(rateLimits)
            ],
            controllers: authControllers,
            providers: [
                // Provide options
                {
                    provide: AUTH_MODULE_OPTIONS,
                    useValue: options
                },
                // MongoDB adapter config derived from options
                createMongodbAdapterConfigProvider(options),
                // Core services
                NestJSMongoDBAdapterService,
                PreferencesService,
                SessionService,
                UserService,
                // Better Auth provider
                authProvider,
                // Guards
                BetterAuthGuard,
                RolesGuard
            ],
            exports: [
                AUTH_MODULE_OPTIONS,
                NestJSMongoDBAdapterService,
                PreferencesService,
                SessionService,
                UserService,
                authProvider,
                BetterAuthGuard,
                RolesGuard,
                MongooseModule
            ]
        };
    }

    /**
     * Configure the AuthModule with async options (e.g., from ConfigService)
     */
    static forRootAsync(asyncOptions: AuthModuleAsyncOptions): DynamicModule {
        return {
            module: AuthModule,
            global: true, // Make auth providers available globally
            imports: [
                MongooseModule.forFeature(authEntities),
                // ThrottlerModule will use defaults; override in options if needed
                ThrottlerModule.forRoot(AUTH_MODULE_DEFAULTS.rateLimits),
                ...(asyncOptions.imports ?? [])
            ],
            controllers: authControllers,
            providers: [
                // Async options provider
                ...this.createAsyncOptionsProviders(asyncOptions),
                // MongoDB adapter config (created dynamically)
                {
                    provide: 'MONGODB_ADAPTER_CONFIG_PROVIDER',
                    useFactory: (options: AuthModuleOptions) =>
                        createMongodbAdapterConfigProvider(options),
                    inject: [AUTH_MODULE_OPTIONS]
                },
                // Core services
                NestJSMongoDBAdapterService,
                PreferencesService,
                SessionService,
                UserService,
                // Better Auth provider
                authProvider,
                // Guards
                BetterAuthGuard,
                RolesGuard
            ],
            exports: [
                AUTH_MODULE_OPTIONS,
                NestJSMongoDBAdapterService,
                PreferencesService,
                SessionService,
                UserService,
                authProvider,
                BetterAuthGuard,
                RolesGuard,
                MongooseModule
            ]
        };
    }

    /**
     * Create providers for async options
     */
    private static createAsyncOptionsProviders(
        asyncOptions: AuthModuleAsyncOptions
    ): Provider[] {
        if (asyncOptions.useFactory) {
            return [
                {
                    provide: AUTH_MODULE_OPTIONS,
                    useFactory: asyncOptions.useFactory,
                    inject: asyncOptions.inject ?? []
                }
            ];
        }

        if (asyncOptions.useClass) {
            return [
                {
                    provide: asyncOptions.useClass,
                    useClass: asyncOptions.useClass
                },
                {
                    provide: AUTH_MODULE_OPTIONS,
                    useFactory: (factory: AuthOptionsFactory) =>
                        factory.createAuthOptions(),
                    inject: [asyncOptions.useClass]
                }
            ];
        }

        if (asyncOptions.useExisting) {
            return [
                {
                    provide: AUTH_MODULE_OPTIONS,
                    useFactory: (factory: AuthOptionsFactory) =>
                        factory.createAuthOptions(),
                    inject: [asyncOptions.useExisting]
                }
            ];
        }

        // Default to empty options
        return [
            {
                provide: AUTH_MODULE_OPTIONS,
                useValue: {}
            }
        ];
    }
}
