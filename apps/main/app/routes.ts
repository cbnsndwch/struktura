import {
    type RouteConfig,
    index,
    prefix,
    route
} from '@react-router/dev/routes';

import authRoutes from './routes/auth/routes.js';

export default [
    index('routes/home.tsx'),
    route('ui-demo', 'routes/ui-demo.tsx'),
    route('onboarding', 'routes/onboarding.tsx'),
    ...prefix('auth', authRoutes)
] satisfies RouteConfig;
