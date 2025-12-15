import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
    layout('features/user-settings/settings-layout.tsx', [
        index('routes/settings/profile.tsx'),
        route('appearance', 'routes/settings/appearance.tsx'),
        route('notifications', 'routes/settings/notifications.tsx'),
        route('security', 'routes/settings/security.tsx')
    ])
] satisfies RouteConfig;
