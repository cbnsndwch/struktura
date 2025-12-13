import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { getConnectionToken } from '@nestjs/mongoose';
import { toNodeHandler } from 'better-auth/node';
import type { Connection } from 'mongoose';
import 'dotenv/config';

import { printStartupBanner } from '@cbnsndwch/struktura-shared-domain';
import { createBetterAuth, getAuth } from '@cbnsndwch/struktura-auth-domain';

import { AppModule } from './app.module.js';
import { mountReactRouterHandler } from './react-router.js';

const logger = new Logger('Bootstrap');

async function bootstrap() {
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

    // Initialize Better Auth with the Mongoose connection's underlying MongoDB client
    const db = mongooseConnection.getClient().db();
    createBetterAuth(db);
    logger.log('Better Auth initialized with Mongoose connection');

    // Get the underlying Express app
    const expressApp = app.getHttpAdapter().getInstance();

    // Mount Better Auth handler BEFORE NestJS routes
    // Important: This must be before express.json() middleware
    // Better Auth handles all /api/auth/* routes
    // Note: Express 5 requires named splat parameters instead of *
    expressApp.all('/api/auth/{*splat}', toNodeHandler(getAuth()));

    // Mount React Router handler for all non-API routes
    await mountReactRouterHandler(app);

    const port = process.env.PORT || 3000;
    await app.listen(port);

    // Handle graceful shutdown
    const shutdown = async () => {
        logger.log('Shutting down...');
        // Mongoose connection is managed by NestJS, no need to close separately
        await app.close();
        process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    await printStartupBanner(app, 'Struktura', logger);
}

bootstrap().catch(error => {
    console.error('Application failed to start:', error);
    process.exit(1);
});
