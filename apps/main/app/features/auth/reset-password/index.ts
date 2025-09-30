import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
    index('features/auth/reset-password/root.tsx'),
    route('invalid-token', 'features/auth/reset-password/invalid-token.tsx'),
    route('success', 'features/auth/reset-password/success.tsx'),
    route('form', 'features/auth/reset-password/form.tsx')
] satisfies RouteConfig;
