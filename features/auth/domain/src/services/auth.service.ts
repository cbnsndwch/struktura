import type { FactoryProvider } from '@nestjs/common';
import type { DBAdapterInstance } from 'better-auth';
import { betterAuth } from 'better-auth/minimal';
import { admin, bearer, jwt } from 'better-auth/plugins';
import { ObjectId } from 'mongodb';

import {
    AUTH_MODULE_OPTIONS,
    AUTH_MODULE_DEFAULTS,
    type AuthModuleOptions
} from '../auth.options.js';

import {
    NestJSMongoDBAdapterService,
    NESTJS_MONGODB_ADAPTER_CONFIG,
    type NestJSMongoDBAdapterConfig
} from './mongoose-nestjs.adapter.js';

export const BETTER_AUTH_SERVICE = Symbol.for('BETTER_AUTH_SERVICE');

/**
 * Factory provider for the Better Auth instance.
 * Uses an async factory to ensure the MongoDB adapter is initialized
 * before creating the Better Auth instance.
 */
export const authProvider: FactoryProvider<Promise<Auth>> = {
    provide: BETTER_AUTH_SERVICE,
    inject: [NestJSMongoDBAdapterService, AUTH_MODULE_OPTIONS],
    useFactory: async (
        adapterService: NestJSMongoDBAdapterService,
        options: AuthModuleOptions
    ): Promise<Auth> => {
        const dbAdapter = await adapterService.getAdapterAsync();
        const instance = createBetterAuth(dbAdapter, options);
        return instance;
    }
};

/**
 * Create the MongoDB adapter config provider from AuthModuleOptions
 */
export function createMongodbAdapterConfigProvider(
    options: AuthModuleOptions
): { provide: symbol; useValue: NestJSMongoDBAdapterConfig } {
    const adapterOptions =
        options.mongodbAdapter ?? AUTH_MODULE_DEFAULTS.mongodbAdapter;
    return {
        provide: NESTJS_MONGODB_ADAPTER_CONFIG,
        useValue: {
            debugLogs: adapterOptions.debugLogs ?? false,
            usePlural: adapterOptions.usePlural ?? false,
            transaction: adapterOptions.transaction ?? true
        }
    };
}

/**
 * Create the Better Auth instance with the NestJS MongoDB adapter
 *
 * JWT Algorithm options (via keyPairConfig):
 * - EdDSA with Ed25519 (default) - Fast and secure
 * - ES256 (ECDSA P-256) - Widely supported EC algorithm
 * - RS256 (RSA 2048) - Maximum compatibility
 * - PS256 (RSA-PSS) - More secure RSA variant
 */
function createBetterAuth(
    dbAdapter: DBAdapterInstance,
    options: AuthModuleOptions
) {
    const opts = mergeWithDefaults(options);

    return betterAuth({
        // Base path for auth endpoints
        basePath: opts.basePath,

        // Secret for session cookie signing and encryption
        secret: opts.secret ?? process.env.BETTER_AUTH_SECRET!,

        // Database configuration with NestJS MongoDB adapter
        database: dbAdapter,

        // Enable email/password authentication
        emailAndPassword: {
            enabled: opts.emailAndPassword.enabled ?? true,
            minPasswordLength: opts.emailAndPassword.minPasswordLength ?? 8
        },

        // User schema customization
        user: {
            modelName: opts.modelNames.user,
            additionalFields: {
                roles: {
                    type: 'string[]',
                    required: false,
                    defaultValue: ['viewer'],
                    input: false
                },
                preferences: {
                    type: 'json',
                    required: false,
                    defaultValue: { theme: 'system' },
                    input: false
                }
            }
        },

        // Session configuration
        session: {
            modelName: opts.modelNames.session,
            expiresIn: opts.session.expiresIn,
            updateAge: opts.session.updateAge
        },

        // Account configuration
        account: {
            modelName: opts.modelNames.account
        },

        // Verification configuration
        verification: {
            modelName: opts.modelNames.verification
        },

        // Plugins for JWT/JWKS support and admin
        plugins: [
            // Admin plugin for user management APIs
            admin(),
            jwt({
                jwks: {
                    keyPairConfig: opts.jwt.keyPairConfig as {
                        alg: 'EdDSA';
                        crv: 'Ed25519';
                    },
                    rotationInterval: opts.jwt.rotationInterval,
                    gracePeriod: opts.jwt.gracePeriod
                },
                jwt: {
                    expirationTime: opts.jwt.expirationTime,
                    definePayload: ({ user }) => ({
                        sub: user.id,
                        email: user.email,
                        name: user.name,
                        roles: (user as { roles?: string }).roles || 'user'
                    })
                }
            }),
            bearer(),
            // Include any additional plugins from options
            ...(options.plugins ?? [])
        ],

        // Advanced options
        advanced: {
            database: {
                generateId: () => new ObjectId().toString()
            }
        },

        // Experimental features
        experimental: {
            joins: opts.experimentalJoins
        }
    });
}

/**
 * Merge user options with defaults
 */
function mergeWithDefaults(options: AuthModuleOptions): Required<
    Omit<AuthModuleOptions, 'secret' | 'plugins'>
> & {
    secret?: string;
} {
    return {
        basePath: options.basePath ?? AUTH_MODULE_DEFAULTS.basePath,
        secret: options.secret,
        jwt: {
            ...AUTH_MODULE_DEFAULTS.jwt,
            ...options.jwt,
            keyPairConfig: {
                ...AUTH_MODULE_DEFAULTS.jwt.keyPairConfig,
                ...options.jwt?.keyPairConfig
            }
        },
        session: {
            ...AUTH_MODULE_DEFAULTS.session,
            ...options.session
        },
        emailAndPassword: {
            ...AUTH_MODULE_DEFAULTS.emailAndPassword,
            ...options.emailAndPassword
        },
        rateLimits: options.rateLimits ?? AUTH_MODULE_DEFAULTS.rateLimits,
        mongodbAdapter: {
            ...AUTH_MODULE_DEFAULTS.mongodbAdapter,
            ...options.mongodbAdapter
        },
        modelNames: {
            ...AUTH_MODULE_DEFAULTS.modelNames,
            ...options.modelNames
        },
        experimentalJoins:
            options.experimentalJoins ?? AUTH_MODULE_DEFAULTS.experimentalJoins
    };
}

/**
 * Type exports for Better Auth
 */
export type Auth = ReturnType<typeof createBetterAuth>;
export type SessionPayload = Auth['$Infer']['Session'];

export type SessionBase = SessionPayload['session'];
export type UserBase = SessionPayload['user'];

export type Session<TSessionState = SessionBase, TUserState = UserBase> = {
    session: TSessionState;
    user: TUserState;
};
