import { Logger } from '@nestjs/common';

import { printStartupBanner } from '@cbnsndwch/struktura-shared-domain';

import { configureApp } from './create-app.js';

const logger = new Logger('Bootstrap');

async function startServer(port: number) {
    const app = await configureApp();

    await app.listen(port);

    return app;
}

if (process.env.NODE_ENV !== 'test' && process.env.PW_TEST !== '1') {
    const port = Number(process.env.PORT ?? 3000);
    startServer(port)
        .then(async app => {
            await printStartupBanner(app, 'Struktura', logger);
        })
        .catch(cause => {
            logger.error(new Error('Failed to start server', { cause }));
            process.exit(1);
        });
}
