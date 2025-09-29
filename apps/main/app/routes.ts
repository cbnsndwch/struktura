import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
    index('routes/home.tsx'),
    route('ui-demo', 'routes/ui-demo.tsx')
    // Add more routes here
] satisfies RouteConfig;
