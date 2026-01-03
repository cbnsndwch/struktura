import 'dotenv/config';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { Connection } from 'mongoose';

import { mountBetterAuthHandler } from '@cbnsndwch/struktura-auth-domain';

import { AppModule } from './app.module.js';
import { mountReactRouterHandler } from './react-router.js';

const logger = new Logger('Bootstrap');

export async function configureApp() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Enable CORS for development
    app.enableCors({
        origin: true,
        credentials: true
    });

    // Get the Mongoose connection and initialize Better Auth with it
    const mongooseConnection = app.get<Connection>(getConnectionToken());

    // Wait for Mongoose to be connected before initializing Better Auth
    if (mongooseConnection.readyState !== 1) {
        await new Promise<void>((resolve, reject) => {
            mongooseConnection.once('connected', resolve);
            mongooseConnection.once('error', reject);
        });
    }

    // Mount Better Auth handler for /api/auth/* routes
    await mountBetterAuthHandler(app);

    // Mount React Router handler for all non-API routes
    await mountReactRouterHandler(app);

    // Handle graceful shutdown
    const shutdown = async () => {
        logger.log('Shutting down...');
        // Mongoose connection is managed by NestJS, no need to close separately
        await app.close();
        process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    // return configured app instance
    return app;
}
