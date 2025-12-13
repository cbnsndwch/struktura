/**
 * Better Auth instance configuration
 *
 * This module sets up Better Auth with MongoDB adapter for the Struktura application.
 * Better Auth handles authentication at the Express level, before NestJS routes.
 *
 * The auth instance is created lazily and uses the Mongoose connection to avoid
 * maintaining a separate MongoDB connection.
 *
 * JWT Configuration:
 * - Uses asymmetric keys (EdDSA/Ed25519 by default) via JWKS
 * - JWKS endpoint available at /api/auth/jwks
 * - Keys are stored in the database and can be rotated
 * - Supports RSA and EC algorithms via configuration
 */
import { betterAuth } from 'better-auth';
import { jwt, bearer } from 'better-auth/plugins';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { ObjectId, type Db } from 'mongodb';

// Store the auth instance once initialized
let authInstance: ReturnType<typeof betterAuth> | null = null;

/**
 * Create the Better Auth instance with a MongoDB database
 *
 * This should be called once during app initialization, after Mongoose is connected.
 * Use `mongoose.connection.getClient().db()` to get the database instance.
 *
 * JWT Algorithm options (via keyPairConfig):
 * - EdDSA with Ed25519 (default) - Fast and secure
 * - ES256 (ECDSA P-256) - Widely supported EC algorithm
 * - RS256 (RSA 2048) - Maximum compatibility
 * - PS256 (RSA-PSS) - More secure RSA variant
 */
export function createBetterAuth(db: Db) {
    if (authInstance) {
        return authInstance;
    }

    authInstance = betterAuth({
        // Base path for auth endpoints (matches existing /api/auth/* routes)
        basePath: '/api/auth',

        // Secret for session cookie signing and encryption
        // Must be at least 32 characters. JWT signing uses asymmetric keys from JWKS.
        secret: process.env.BETTER_AUTH_SECRET!,

        // Database configuration with MongoDB adapter
        // Uses the same connection as Mongoose
        database: mongodbAdapter(db),

        // Enable email/password authentication
        emailAndPassword: {
            enabled: true,
            // Password requirements
            minPasswordLength: 8
        },

        // User schema customization to match existing user model
        user: {
            modelName: 'ba_user',
            additionalFields: {
                // Add custom fields that exist in current User entity
                roles: {
                    type: 'string',
                    required: false,
                    defaultValue: 'user',
                    input: false // Don't allow user to set roles on signup
                },
                // User preferences stored as JSON string
                // Default: {"theme":"system"}
                preferences: {
                    type: 'string',
                    required: false,
                    defaultValue: '{"theme":"system"}',
                    input: false // Managed via dedicated preferences API
                }
            }
        },

        // Session configuration
        session: {
            modelName: 'ba_session',
            // Session expiration (7 days by default)
            expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
            // Update session if it expires in less than 1 day
            updateAge: 60 * 60 * 24 // 1 day in seconds
        },

        // Account configuration (for OAuth/credential providers)
        account: {
            modelName: 'ba_account'
        },

        // Verification configuration (for email verification, password reset, etc.)
        verification: {
            modelName: 'ba_verification'
        },

        // Plugins for JWT/JWKS support
        plugins: [
            // JWT plugin provides /token endpoint and /jwks for public keys
            jwt({
                jwks: {
                    // Use EdDSA with Ed25519 curve (default, fast and secure)
                    // For RSA: { alg: 'RS256', modulusLength: 2048 }
                    // For EC: { alg: 'ES256' }
                    keyPairConfig: {
                        alg: 'EdDSA',
                        crv: 'Ed25519'
                    },
                    // Enable automatic key rotation (30 days)
                    rotationInterval: 60 * 60 * 24 * 30,
                    // Grace period for old keys (30 days)
                    gracePeriod: 60 * 60 * 24 * 30
                },
                jwt: {
                    // JWT expiration time
                    expirationTime: '15m',
                    // Custom payload - include essential user info
                    definePayload: ({ user }) => ({
                        sub: user.id,
                        email: user.email,
                        name: user.name,
                        roles: (user as { roles?: string }).roles || 'user'
                    })
                }
            }),
            // Bearer plugin allows using JWT tokens in Authorization header
            bearer()
        ],

        // Advanced options
        advanced: {
            // Generate IDs compatible with existing MongoDB ObjectIds
            database: {
                generateId: () => new ObjectId().toString()
            }
        },

        // see {@link https://www.better-auth.com/docs/adapters/mongo#joins-experimental}
        experimental: {
            joins: true
        }
    });

    return authInstance;
}

/**
 * Get the Better Auth instance
 *
 * @throws Error if auth has not been initialized with createBetterAuth()
 */
export function getAuth() {
    if (!authInstance) {
        throw new Error(
            'Better Auth has not been initialized. Call createBetterAuth() first.'
        );
    }
    return authInstance;
}

/**
 * Type exports for Better Auth
 */
export type Auth = ReturnType<typeof betterAuth>;
export type Session = Auth['$Infer']['Session'];
export type User = Session['user'];
