import { type RouteConfig, route } from '@react-router/dev/routes';

export default [
    route('examples/components', 'examples/components/page.tsx'),
    route('examples/ui-demo', 'examples/ui-demo/page.tsx')
] satisfies RouteConfig;
