import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
    index('features/workspaces/workspaces.tsx'),
    route(':workspaceId', 'features/workspaces/workspace-details.tsx', [
        // Collection routes within workspace
        route('collections/:collectionId', 'features/workspaces/collection-view.tsx')
    ])
] satisfies RouteConfig;
