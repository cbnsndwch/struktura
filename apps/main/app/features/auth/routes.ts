import {
    type RouteConfig,
    index,
    prefix,
    route
} from '@react-router/dev/routes';

import resetPasswordRoutes from './reset-password/index.js';

export default [
    index('routes/auth/login.tsx', { id: 'auth-index' }),
    route('login', 'routes/auth/login.tsx'),
    route('signup', 'routes/auth/signup.tsx'),
    route('verify-email', 'routes/auth/verify-email.tsx'),
    ...prefix('reset-password', resetPasswordRoutes)
] satisfies RouteConfig;
