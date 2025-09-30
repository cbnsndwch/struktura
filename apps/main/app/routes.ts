import { type RouteConfig, prefix } from '@react-router/dev/routes';

import authRoutes from './routes/auth/routes.js';
import otherRoutes from './routes/other/routes.js';
import publicRoutes from './routes/public/routes.js';
import globalRoutes from './routes/global/routes.js';
import workspaceRoutes from './routes/workspaces/routes.js';

export default [
    ...publicRoutes,
    ...globalRoutes,
    ...otherRoutes,

    ...prefix('workspaces', workspaceRoutes),
    ...prefix('auth', authRoutes)
] satisfies RouteConfig;
