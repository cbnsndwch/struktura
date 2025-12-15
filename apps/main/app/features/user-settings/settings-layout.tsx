/**
 * Settings layout with sidebar navigation
 */
import { Link, Outlet, useLocation } from 'react-router';
import { User, Bell, Shield, Palette, type LucideIcon } from 'lucide-react';
import { cn } from '@cbnsndwch/struktura-shared-ui/lib/utils';

interface SettingsNavItem {
    title: string;
    href: string;
    icon: LucideIcon;
}

const settingsNavItems: SettingsNavItem[] = [
    {
        title: 'Profile',
        href: '/settings/profile',
        icon: User
    },
    {
        title: 'Appearance',
        href: '/settings/appearance',
        icon: Palette
    },
    {
        title: 'Notifications',
        href: '/settings/notifications',
        icon: Bell
    },
    {
        title: 'Account Security',
        href: '/settings/security',
        icon: Shield
    }
];

export function SettingsLayout() {
    const location = useLocation();

    return (
        <div className="flex min-h-screen flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <Link
                        to="/workspaces"
                        className="mr-6 flex items-center space-x-2"
                    >
                        <span className="font-bold">← Back to Workspaces</span>
                    </Link>
                    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                        <nav className="flex items-center">
                            <h1 className="text-lg font-semibold">Settings</h1>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main content with sidebar */}
            <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 py-6">
                {/* Sidebar navigation */}
                <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
                    <nav className="grid gap-1 px-2 py-4">
                        {settingsNavItems.map(item => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-secondary text-secondary-foreground'
                                            : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Content area */}
                <main className="flex w-full flex-col overflow-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
