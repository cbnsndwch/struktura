import {
    type RouteConfig,
    index,
    prefix,
    route
} from '@react-router/dev/routes';

import resetPasswordRoutes from './reset-password/index.js';

export default [
    index('features/auth/login.tsx', { id: 'auth-index' }),
    route('login', 'features/auth/login.tsx'),
    route('signup', 'features/auth/signup.tsx'),
    route('verify-email', 'features/auth/verify-email.tsx'),
    ...prefix('reset-password', resetPasswordRoutes)
] satisfies RouteConfig;
