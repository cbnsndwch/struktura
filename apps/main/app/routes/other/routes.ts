import { route, type RouteConfig } from '@react-router/dev/routes';

export default [
    route('favicon.ico', 'routes/other/favicon.ts'),
    route('unauthorized', 'routes/other/unauthorized.tsx')
] satisfies RouteConfig;
