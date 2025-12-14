import { join } from 'node:path';

import type { NestExpressApplication } from '@nestjs/platform-express';
import { static as expressStatic, type Request } from 'express';
import { createRequestHandler } from '@react-router/express';
import { fromNodeHeaders } from 'better-auth/node';

import {
    TOKEN_AUTH_SERVICE,
    type SessionPayload,
    type Auth
} from '@cbnsndwch/struktura-auth-domain';
import {
    WorkspaceService,
    createWorkspaceLoader
} from '@cbnsndwch/struktura-workspace-domain';
import type { IWorkspaceLoader } from '@cbnsndwch/struktura-workspace-contracts';

// Default paths handled by NestJS (excluding specific React Router API routes)
const DEFAULT_NEST_PATHS = ['/graphql', '/api'];

// Path to the React Router server build
const BUILD_PATH = join(process.cwd(), 'build', 'server', 'index.js');

/**
 * App Load Context - passed to React Router loaders/actions

 * This provides access to NestJS services and Better Auth from React Router.
 *
 * IMPORTANT: Services are exposed via interfaces (ISP) to avoid bundling
 * Nest code into the Vite build. The actual implementations are resolved
 * from the Nest IoC container and adapted here.
 */
export interface AppLoadContext {
    [key: string]: unknown;
    auth: Auth;
    /**
     * Workspace loader service (ISP - Interface Segregation Principle)
     * This is an adapter around the NestJS WorkspaceService.
     */
    workspaces: IWorkspaceLoader;
    /**
     * Get the current session from Better Auth, or `null `if not authenticated
     */
    getSession: () => Promise<SessionPayload | null>;
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

    function getLoadContext(req: Request): AppLoadContext {
        // better auth instance from Nest IoC container
        const auth = nestApp.get<Auth>(TOKEN_AUTH_SERVICE);

        // Resolve workspace service from Nest IoC container and create adapter
        const workspaceService = nestApp.get(WorkspaceService);
        const workspaces = createWorkspaceLoader(workspaceService);

        const getSession = async () => {
            try {
                const headers = fromNodeHeaders(req.headers);
                const session = await auth.api.getSession({ headers });
                return session;
            } catch {
                return null;
            }
        };

        return {
            auth,
            getSession,
            workspaces
        };
    }

    const reactRouterHandler = createRequestHandler({
        build: viteDevServer ? build : build.default,
        getLoadContext
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
