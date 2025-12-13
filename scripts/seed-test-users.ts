/**
 * Seed script to create test users in the database.
 *
 * Usage:
 *   npx tsx scripts/seed-test-users.ts
 *
 * Environment variables:
 *   DATABASE_URL - MongoDB connection string (defaults to mongodb://localhost:27017/struktura-dev)
 */

import * as bcrypt from 'bcrypt';
import mongoose from 'mongoose';

// User schema definition (simplified for seeding)
const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        passwordHash: { type: String, required: true },
        emailVerified: { type: Boolean, default: false },
        roles: { type: [String], default: ['editor'] },
        timezone: { type: String },
        language: { type: String, default: 'en' },
        preferences: {
            type: Object,
            default: { theme: 'system' }
        },
        profile: { type: Object },
        emailVerificationToken: { type: String },
        emailVerificationExpires: { type: Date },
        passwordResetToken: { type: String },
        passwordResetExpires: { type: Date },
        lastLoginAt: { type: Date }
    },
    {
        timestamps: true,
        collection: 'users'
    }
);

const User = mongoose.model('User', userSchema);

interface TestUser {
    email: string;
    name: string;
    password: string;
    roles: string[];
    emailVerified: boolean;
}

const TEST_USERS: TestUser[] = [
    {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        roles: ['editor'],
        emailVerified: true // Pre-verified for testing
    },
    {
        email: 'admin@example.com',
        name: 'Admin User',
        password: 'admin123',
        roles: ['admin'],
        emailVerified: true
    },
    {
        email: 'viewer@example.com',
        name: 'Viewer User',
        password: 'viewer123',
        roles: ['viewer'],
        emailVerified: true
    }
];

async function seedUsers() {
    const databaseUrl =
        process.env.DATABASE_URL || 'mongodb://localhost:27017/struktura-dev';

    console.log('🌱 Seeding test users...');
    console.log(`📦 Connecting to: ${databaseUrl.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@')}`);

    try {
        await mongoose.connect(databaseUrl);
        console.log('✅ Connected to MongoDB');

        const saltRounds = 12;

        for (const testUser of TEST_USERS) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: testUser.email });

            if (existingUser) {
                console.log(`⏭️  User ${testUser.email} already exists, skipping...`);
                continue;
            }

            // Hash password
            const passwordHash = await bcrypt.hash(testUser.password, saltRounds);

            // Create user
            const user = new User({
                email: testUser.email,
                name: testUser.name,
                passwordHash,
                emailVerified: testUser.emailVerified,
                roles: testUser.roles,
                language: 'en',
                preferences: { theme: 'system' }
            });

            await user.save();
            console.log(`✅ Created user: ${testUser.email} (${testUser.roles.join(', ')})`);
        }

        console.log('\n🎉 Seeding complete!\n');
        console.log('Test credentials:');
        console.log('─'.repeat(50));
        for (const testUser of TEST_USERS) {
            console.log(`  Email: ${testUser.email}`);
            console.log(`  Password: ${testUser.password}`);
            console.log(`  Roles: ${testUser.roles.join(', ')}`);
            console.log('─'.repeat(50));
        }
    } catch (error) {
        console.error('❌ Error seeding users:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    }
}

seedUsers();
