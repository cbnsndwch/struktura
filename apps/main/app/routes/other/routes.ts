import { route, type RouteConfig } from '@react-router/dev/routes';

export default [
    route('favicon.ico', 'routes/other/favicon.ts'),
    route('ui-demo', 'routes/other/ui-demo.tsx'),
    route('unauthorized', 'routes/other/unauthorized.tsx')
] satisfies RouteConfig;
