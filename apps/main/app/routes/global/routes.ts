import { route, type RouteConfig } from '@react-router/dev/routes';

export default [
    route('onboarding', 'routes/global/onboarding.tsx'),
    route('dashboard', 'routes/global/dashboard.tsx')
] satisfies RouteConfig;
