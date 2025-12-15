import { AuthModule } from '@cbnsndwch/struktura-auth-domain/module';

/**
 * Auth module configuration for the main application.
 *
 * Uses AuthModule.forRoot() with default options.
 * The module will automatically wait for the MongoDB connection to be ready
 * before initializing Better Auth.
 *
 * Configuration is loaded from environment variables:
 * - BETTER_AUTH_SECRET: Secret for session signing (required, min 32 chars)
 *
 * @see AuthModuleOptions for all available configuration options
 */
export const authModule = AuthModule.forRoot({
    // Base path for auth endpoints (default: '/api/auth')
    // basePath: '/api/auth',

    // Session configuration
    // session: {
    //     expiresIn: 60 * 60 * 24 * 7, // 7 days
    //     updateAge: 60 * 60 * 24      // 1 day
    // },

    // JWT configuration
    // jwt: {
    //     expirationTime: '15m',
    //     rotationInterval: 60 * 60 * 24 * 30, // 30 days
    //     gracePeriod: 60 * 60 * 24 * 30       // 30 days
    // },

    // MongoDB adapter configuration
    mongodbAdapter: {
        transaction: true
    }
});
