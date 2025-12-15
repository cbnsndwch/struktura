import type { NestExpressApplication } from '@nestjs/platform-express';
import { toNodeHandler } from 'better-auth/node';

import { type Auth, BETTER_AUTH_SERVICE } from './services/auth.service.js';

/**
 * Mount Better Auth handler BEFORE NestJS routes
 * Important: This must be called before express.json() middleware
 * Better Auth handles all /api/auth/* routes
 *
 * @param nestApp The NestJS Express application instance, used to resolve the
 * Better Auth instance and mount the handler
 */
export async function mountBetterAuthHandler(nestApp: NestExpressApplication) {
    // resolve Better Auth instance the from NestJS IoC container
    const auth = nestApp.get<Auth>(BETTER_AUTH_SERVICE);

    // Get the underlying Express app
    const expressApp = nestApp.getHttpAdapter().getInstance();

    // Express 5 requires named splat parameters instead of plain `/*`
    expressApp.all('/api/auth/{*splat}', toNodeHandler(auth));
}
