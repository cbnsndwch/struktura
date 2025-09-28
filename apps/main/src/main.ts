import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { printStartupBanner } from '@cbnsndwch/struktura-shared-domain';

import { AppModule } from './app.module.js';

const logger = new Logger('Bootstrap');

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Enable CORS for development
    app.enableCors();

    const port = process.env.PORT || 3000;
    await app.listen(port);

    await printStartupBanner(app, 'Struktura', logger);
}

bootstrap().catch(error => {
    console.error('Application failed to start:', error);
    process.exit(1);
});
