/**
 * Seed script to create test users via Better Auth API.
 *
 * This script uses Better Auth's server-side API to create users,
 * ensuring they are properly set up with password hashing and
 * session management compatible with the auth system.
 *
 * Usage:
 *   npx tsx scripts/seed-test-users.ts
 *
 * Environment variables:
 *   DATABASE_URL - MongoDB connection string (defaults to mongodb://[::1]:27017/struktura-dev)
 *   BETTER_AUTH_SECRET - Secret for Better Auth session cookies (uses default dev secret if not set)
 */

import { MongoClient } from 'mongodb';
import { APIError } from 'better-auth/api';
import 'dotenv/config';

import { createBetterAuth, getAuth } from '@cbnsndwch/struktura-auth-domain';

// Default development secret (32+ chars required) - NEVER use in production
const DEV_AUTH_SECRET = 'struktura-dev-secret-minimum-32-chars-required';

interface TestUser {
    email: string;
    name: string;
    password: string;
    roles: string;
    emailVerified: boolean;
}

const TEST_USERS: TestUser[] = [
    {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        roles: 'editor',
        emailVerified: true // Pre-verified for testing
    },
    {
        email: 'admin@example.com',
        name: 'Admin User',
        password: 'admin123',
        roles: 'admin',
        emailVerified: true
    },
    {
        email: 'viewer@example.com',
        name: 'Viewer User',
        password: 'viewer123',
        roles: 'viewer',
        emailVerified: true
    }
];

async function seedUsers() {
    // Use IPv6 localhost for MongoDB connection (matches local dev setup)
    const databaseUrl =
        process.env.DATABASE_URL || 'mongodb://[::1]:27017/struktura-dev';

    console.log('🌱 Seeding test users via Better Auth...');
    console.log(
        `📦 Connecting to: ${databaseUrl.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@')}`
    );

    // Use development secret if not set (only for seeding/development)
    if (!process.env.BETTER_AUTH_SECRET) {
        console.log('⚠️  BETTER_AUTH_SECRET not set, using development default');
        process.env.BETTER_AUTH_SECRET = DEV_AUTH_SECRET;
    }

    const client = new MongoClient(databaseUrl);

    try {
        await client.connect();
        const db = client.db();
        console.log('✅ Connected to MongoDB');

        // Initialize Better Auth with the database
        createBetterAuth(db);
        const auth = getAuth();
        console.log('✅ Better Auth initialized');

        // Get collections for direct operations (using ba_ prefix)
        const usersCollection = db.collection('ba_user');

        for (const testUser of TEST_USERS) {
            try {
                // Check if user already exists
                const existingUser = await usersCollection.findOne({
                    email: testUser.email
                });

                if (existingUser) {
                    console.log(
                        `⏭️  User ${testUser.email} already exists, updating roles...`
                    );
                    // Update roles and emailVerified status for existing user
                    await usersCollection.updateOne(
                        { email: testUser.email },
                        {
                            $set: {
                                roles: testUser.roles,
                                emailVerified: testUser.emailVerified
                            }
                        }
                    );
                    console.log(
                        `✅ Updated user: ${testUser.email} (${testUser.roles})`
                    );
                    continue;
                }

                // Create user via Better Auth API
                const result = await auth.api.signUpEmail({
                    body: {
                        email: testUser.email,
                        password: testUser.password,
                        name: testUser.name
                    }
                });

                if (!result?.user) {
                    console.error(
                        `❌ Failed to create user ${testUser.email}: No user returned`
                    );
                    continue;
                }

                // Update user with additional fields (roles, emailVerified)
                // Better Auth doesn't allow setting these during signup
                await usersCollection.updateOne(
                    { id: result.user.id },
                    {
                        $set: {
                            roles: testUser.roles,
                            emailVerified: testUser.emailVerified
                        }
                    }
                );

                console.log(
                    `✅ Created user: ${testUser.email} (${testUser.roles})`
                );
            } catch (error) {
                if (error instanceof APIError) {
                    // Handle specific API errors
                    if (error.message?.includes('already exists')) {
                        console.log(
                            `⏭️  User ${testUser.email} already exists (API check), skipping...`
                        );
                        continue;
                    }
                    console.error(
                        `❌ API Error creating user ${testUser.email}:`,
                        error.message
                    );
                } else {
                    console.error(
                        `❌ Error creating user ${testUser.email}:`,
                        error
                    );
                }
            }
        }

        console.log('\n🎉 Seeding complete!\n');
        console.log('Test credentials:');
        console.log('─'.repeat(50));
        for (const testUser of TEST_USERS) {
            console.log(`  Email: ${testUser.email}`);
            console.log(`  Password: ${testUser.password}`);
            console.log(`  Roles: ${testUser.roles}`);
            console.log('─'.repeat(50));
        }
    } catch (error) {
        console.error('❌ Error seeding users:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('\n👋 Disconnected from MongoDB');
    }
}

seedUsers();
