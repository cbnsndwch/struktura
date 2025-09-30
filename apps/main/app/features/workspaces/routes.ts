import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
    index('features/workspaces/workspaces.tsx'),
    route(':workspaceId', 'features/workspaces/workspace-details.tsx')
] satisfies RouteConfig;
