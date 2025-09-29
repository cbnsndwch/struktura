import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
    index('routes/auth/reset-password/root.tsx'),
    route('invalid-token', 'routes/auth/reset-password/invalid-token.tsx'),
    route('success', 'routes/auth/reset-password/success.tsx'),
    route('form', 'routes/auth/reset-password/form.tsx')
] satisfies RouteConfig;
