import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
    index('routes/home.tsx'),
    route('ui-demo', 'routes/ui-demo.tsx'),
    route('auth/login', 'routes/auth/login.tsx'),
    route('auth/signup', 'routes/auth/signup.tsx'),
    route('auth/verify-email', 'routes/auth/verify-email.tsx'),
    route('auth/reset-password', 'routes/auth/reset-password.tsx')
] satisfies RouteConfig;
