import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';

import { makeTable } from './strings.js';

export async function printStartupBanner(
    app: NestExpressApplication,
    appName: string,
    logger: Logger
) {
    const baseUrl = await app
        .getUrl()
        .then(url => url.replace('[::1]', 'localhost'));
    const banner = makeTable(
        {
            'Base URL': baseUrl,
            Docs: `${baseUrl}/docs`,
            Apollo: `${baseUrl}/graphql`
        },
        `🙌 ${appName} is up and running 🙌`
    );
    banner.forEach(line => logger.log(line));
}
