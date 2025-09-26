import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS for development
    app.enableCors();

    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.log(
        `🚀 Struktura application is running on: http://localhost:${port}`
    );
    console.log(`📊 GraphQL Playground: http://localhost:${port}/graphql`);
}

bootstrap().catch(error => {
    console.error('Application failed to start:', error);
    process.exit(1);
});
