import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            useFactory: () => ({
                uri: process.env.DATABASE_URL!,
                // Connection options
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 10000, // Increased timeout
                connectTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                bufferCommands: false,
                // Don't fail fast in development
                retryAttempts: 3,
                retryDelay: 1000,
                // Allow the app to start without waiting for DB
                lazyConnection: true
            })
        })
    ],
    exports: [MongooseModule]
})
export class DbModule {}
