import type {
    InjectionToken,
    ModuleMetadata,
    OptionalFactoryDependency,
    Type
} from '@nestjs/common';
import type { BetterAuthOptions } from 'better-auth';

/**
 * JWT Key Pair Configuration
 */
export interface JwtKeyPairConfig {
    /**
     * Algorithm to use for JWT signing
     * @default 'EdDSA'
     */
    alg?: 'EdDSA' | 'ES256' | 'RS256' | 'PS256';

    /**
     * Curve for EdDSA algorithm
     * @default 'Ed25519'
     */
    crv?: 'Ed25519';

    /**
     * Modulus length for RSA algorithms (RS256, PS256)
     */
    modulusLength?: number;
}

/**
 * JWT Configuration Options
 */
export interface JwtOptions {
    /**
     * JWT expiration time
     * @default '15m'
     */
    expirationTime?: string;

    /**
     * Key rotation interval in seconds
     * @default 30 days (60 * 60 * 24 * 30)
     */
    rotationInterval?: number;

    /**
     * Grace period for old keys in seconds
     * @default 30 days (60 * 60 * 24 * 30)
     */
    gracePeriod?: number;

    /**
     * Key pair configuration
     */
    keyPairConfig?: JwtKeyPairConfig;
}

/**
 * Session Configuration Options
 */
export interface SessionOptions {
    /**
     * Session expiration time in seconds
     * @default 7 days (604800)
     */
    expiresIn?: number;

    /**
     * Update session if it expires in less than this time in seconds
     * @default 1 day (86400)
     */
    updateAge?: number;
}

/**
 * Email/Password Authentication Options
 */
export interface EmailPasswordOptions {
    /**
     * Whether email/password authentication is enabled
     * @default true
     */
    enabled?: boolean;

    /**
     * Minimum password length
     * @default 8
     */
    minPasswordLength?: number;
}

/**
 * Rate Limiting Configuration
 */
export interface RateLimitConfig {
    /**
     * Name of the rate limit tier
     */
    name: string;

    /**
     * Time-to-live in milliseconds
     */
    ttl: number;

    /**
     * Maximum number of requests within the TTL
     */
    limit: number;
}

/**
 * MongoDB Adapter Configuration
 */
export interface MongoDBAdapterOptions {
    /**
     * Enable debug logs for the adapter
     * @default false
     */
    debugLogs?: boolean;

    /**
     * Use plural table names
     * @default false
     */
    usePlural?: boolean;

    /**
     * Whether to execute multiple operations in a transaction
     * @default true
     */
    transaction?: boolean;
}

/**
 * Model Name Configuration
 */
export interface ModelNames {
    /**
     * User model/collection name
     * @default 'ba_user'
     */
    user?: string;

    /**
     * Session model/collection name
     * @default 'ba_session'
     */
    session?: string;

    /**
     * Account model/collection name
     * @default 'ba_account'
     */
    account?: string;

    /**
     * Verification model/collection name
     * @default 'ba_verification'
     */
    verification?: string;
}

/**
 * AuthModule Configuration Options
 */
export interface AuthModuleOptions {
    /**
     * Base path for auth endpoints
     * @default '/api/auth'
     */
    basePath?: string;

    /**
     * Secret for session cookie signing and encryption
     * Must be at least 32 characters.
     * @default process.env.BETTER_AUTH_SECRET
     */
    secret?: string;

    /**
     * JWT configuration options
     */
    jwt?: JwtOptions;

    /**
     * Session configuration options
     */
    session?: SessionOptions;

    /**
     * Email/password authentication options
     */
    emailAndPassword?: EmailPasswordOptions;

    /**
     * Rate limiting configuration
     * @default [{ name: 'short', ttl: 1000, limit: 3 }, { name: 'medium', ttl: 60000, limit: 20 }]
     */
    rateLimits?: RateLimitConfig[];

    /**
     * MongoDB adapter options
     */
    mongodbAdapter?: MongoDBAdapterOptions;

    /**
     * Model/collection names
     */
    modelNames?: ModelNames;

    /**
     * Enable experimental joins feature
     * @see https://www.better-auth.com/docs/adapters/mongo#joins-experimental
     * @default true
     */
    experimentalJoins?: boolean;

    /**
     * Additional Better Auth plugins to register
     */
    plugins?: BetterAuthOptions['plugins'];
}

/**
 * Injection token for AuthModule options
 */
export const AUTH_MODULE_OPTIONS = Symbol.for('AUTH_MODULE_OPTIONS');

/**
 * Factory interface for async options
 */
export interface AuthOptionsFactory {
    createAuthOptions(): Promise<AuthModuleOptions> | AuthModuleOptions;
}

/**
 * Async module options for AuthModule.forRootAsync()
 */
export interface AuthModuleAsyncOptions extends Pick<
    ModuleMetadata,
    'imports'
> {
    /**
     * Use an existing provider as the options factory
     */
    useExisting?: Type<AuthOptionsFactory>;

    /**
     * Use a class as the options factory
     */
    useClass?: Type<AuthOptionsFactory>;

    /**
     * Use a factory function to create options
     */
    useFactory?: (
        ...args: unknown[]
    ) => Promise<AuthModuleOptions> | AuthModuleOptions;

    /**
     * Dependencies to inject into the factory
     */
    inject?: Array<InjectionToken | OptionalFactoryDependency>;
}

/**
 * Default configuration values
 */
export const AUTH_MODULE_DEFAULTS: Required<
    Omit<AuthModuleOptions, 'secret' | 'plugins'>
> = {
    basePath: '/api/auth',
    jwt: {
        expirationTime: '15m',
        rotationInterval: 60 * 60 * 24 * 30, // 30 days
        gracePeriod: 60 * 60 * 24 * 30, // 30 days
        keyPairConfig: {
            alg: 'EdDSA',
            crv: 'Ed25519'
        }
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24 // 1 day
    },
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8
    },
    rateLimits: [
        { name: 'short', ttl: 1000, limit: 3 },
        { name: 'medium', ttl: 60000, limit: 20 }
    ],
    mongodbAdapter: {
        debugLogs: false,
        usePlural: false,
        transaction: true
    },
    modelNames: {
        user: 'ba_user',
        session: 'ba_session',
        account: 'ba_account',
        verification: 'ba_verification'
    },
    experimentalJoins: true
};
