import { join } from 'node:path';

import type { NestExpressApplication } from '@nestjs/platform-express';
import { static as expressStatic, type Request } from 'express';
import { createRequestHandler } from '@react-router/express';
import { fromNodeHeaders } from 'better-auth/node';

import { getAuth, type Auth } from '@cbnsndwch/struktura-auth-domain';

// Default paths handled by NestJS (excluding specific React Router API routes)
const DEFAULT_NEST_PATHS = ['/graphql', '/api'];

// Path to the React Router server build
const BUILD_PATH = join(process.cwd(), 'build', 'server', 'index.js');

/**
 * App Load Context - passed to React Router loaders/actions
 * This provides access to NestJS services and Better Auth from React Router
 */
export interface AppLoadContext {
    [key: string]: unknown;
    app: NestExpressApplication;
    auth: Auth;
    /**
     * Get the current session from Better Auth
     * Returns null if not authenticated
     */
    getSession: () => Promise<{
        session: {
            id: string;
            userId: string;
            token: string;
            expiresAt: Date;
            ipAddress?: string | null;
            userAgent?: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        user: {
            id: string;
            email: string;
            name: string;
            emailVerified: boolean;
            image?: string | null;
            createdAt: Date;
            updatedAt: Date;
            roles?: string | null;
            preferences?: string | null;
        };
    } | null>;
}

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
        getLoadContext(req: Request): AppLoadContext {
            const auth = getAuth();
            return {
                app: nestApp,
                auth,
                getSession: async () => {
                    try {
                        const session = await auth.api.getSession({
                            headers: fromNodeHeaders(req.headers)
                        });
                        return session;
                    } catch {
                        return null;
                    }
                }
            };
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
