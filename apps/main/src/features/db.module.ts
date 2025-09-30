import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            useFactory: () => ({
                uri:
                    process.env.DATABASE_URL ||
                    'mongodb://localhost:27017/struktura-dev',
                // Connection options
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 2000, // Reduced timeout
                socketTimeoutMS: 45000,
                bufferCommands: false,
                // Don't fail fast in development
                retryAttempts: 2, // Reduced retries
                retryDelay: 1000,
                // Allow the app to start without waiting for DB
                lazyConnection: true
            })
        })
    ],
    exports: [MongooseModule]
})
export class DbModule {}
