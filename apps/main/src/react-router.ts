import { join } from 'node:path';

import type { NestExpressApplication } from '@nestjs/platform-express';
import { static as expressStatic } from 'express';
import { createRequestHandler } from '@react-router/express';

// Default paths handled by NestJS (excluding specific React Router API routes)
const DEFAULT_NEST_PATHS = ['/graphql', '/api'];

// Path to the React Router server build
const BUILD_PATH = join(process.cwd(), 'build', 'server', 'index.js');

export async function mountReactRouterHandler(
    nestApp: NestExpressApplication,
    nestPaths = DEFAULT_NEST_PATHS
) {
    const viteDevServer =
        process.env.NODE_ENV === 'production'
            ? undefined
            : await import('vite').then(vite =>
                  vite.createServer({
                      server: { middlewareMode: true }
                  })
              );

    const build = viteDevServer
        ? () => viteDevServer.ssrLoadModule('virtual:react-router/server-build')
        : await import(BUILD_PATH);

    const reactRouterHandler = createRequestHandler({
        build: viteDevServer ? build : build.default,
        getLoadContext() {
            return { app: nestApp };
        }
    });

    const expressApp = nestApp.getHttpAdapter().getInstance();

    // Handle asset requests
    if (viteDevServer) {
        expressApp.use(viteDevServer.middlewares);
    } else {
        // Vite fingerprints its assets so we can cache forever
        expressApp.use(
            '/assets',
            expressStatic('build/client/assets', {
                immutable: true,
                maxAge: '1y'
            })
        );
    }

    // Everything else (like favicon.ico) is cached for an hour
    expressApp.use(expressStatic('build/client', { maxAge: '1h' }));

    // Mount the React Router handler for all non-Nest paths
    expressApp.use((req, res, next) => {
        // Handle REST & GraphQL routes with Nest
        if (nestPaths.some(path => req.url.startsWith(path))) {
            return next();
        }

        // Let React Router handle everything else
        return reactRouterHandler(req, res, next);
    });
}
