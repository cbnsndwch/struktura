import { type RouteConfig, prefix } from '@react-router/dev/routes';

import authRoutes from './features/auth/routes.js';
import onboardingRoutes from './features/onboarding/routes.js';
import workspaceRoutes from './features/workspaces/routes.js';

import otherRoutes from './routes/other/routes.js';
import publicRoutes from './routes/public/routes.js';
import globalRoutes from './routes/global/routes.js';

export default [
    ...publicRoutes,
    ...globalRoutes,
    ...otherRoutes,

    ...prefix('onboarding', onboardingRoutes),
    ...prefix('workspaces', workspaceRoutes),
    ...prefix('auth', authRoutes)
] satisfies RouteConfig;
