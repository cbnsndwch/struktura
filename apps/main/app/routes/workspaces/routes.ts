import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
    index('routes/workspaces/workspaces.tsx'),
    route(':workspaceId', 'routes/workspaces/workspace-details.tsx')
] satisfies RouteConfig;
