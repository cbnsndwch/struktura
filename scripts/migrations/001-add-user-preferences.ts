#!/usr/bin/env tsx
/**
 * Migration: Add preferences field to existing users
 * 
 * This migration adds a preferences object with default theme 'system' 
 * to all existing users who don't have preferences set.
 */

import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
    const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/struktura';
    
    console.log('🚀 Starting user preferences migration...');
    console.log(`📡 Connecting to: ${mongoUrl.replace(/\/\/.*@/, '//***@')}`);
    
    const client = new MongoClient(mongoUrl);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db();
        const usersCollection = db.collection('users');
        
        // Find users without preferences field
        const usersWithoutPreferences = await usersCollection.countDocuments({
            preferences: { $exists: false }
        });
        
        console.log(`📊 Found ${usersWithoutPreferences} users without preferences`);
        
        if (usersWithoutPreferences === 0) {
            console.log('✅ All users already have preferences, nothing to migrate');
            return;
        }
        
        // Update users without preferences to have default theme
        const result = await usersCollection.updateMany(
            { preferences: { $exists: false } },
            { 
                $set: { 
                    preferences: { 
                        theme: 'system' 
                    },
                    updatedAt: new Date()
                } 
            }
        );
        
        console.log(`✅ Migration complete: Updated ${result.modifiedCount} users`);
        console.log(`📈 Users now have default theme preference: 'system'`);
        
        // Verify the migration
        const totalUsers = await usersCollection.countDocuments({});
        const usersWithPreferences = await usersCollection.countDocuments({
            preferences: { $exists: true }
        });
        
        console.log(`📊 Verification: ${usersWithPreferences}/${totalUsers} users now have preferences`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('🔌 Database connection closed');
    }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error('❌ Migration script failed:', error);
        process.exit(1);
    });
}

export { main as migrateUserPreferences };