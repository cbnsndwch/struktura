import type { MetaFunction } from 'react-router';

// Import components from the shared UI workspace - using multiple import patterns to test integration
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Badge,
    Input,
    Label,
    ThemeToggle,
    SimpleThemeToggle,
    useTheme
} from '@cbnsndwch/struktura-shared-ui';
import { cn } from '@cbnsndwch/struktura-shared-ui/lib/utils.js';

export const meta: MetaFunction = () => {
    return [
        { title: 'UI Demo • Struktura' },
        {
            name: 'description',
            content: 'Demonstration of shared UI component integration'
        }
    ];
};

export default function UIDemo() {
    const { theme, resolvedTheme } = useTheme();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <Badge variant="secondary">
                            🎨 UI Integration Demo (Hot Reload Test!)
                        </Badge>
                        <div className="flex gap-2">
                            <SimpleThemeToggle />
                            <ThemeToggle />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">
                        Shared UI Component Integration
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        This page demonstrates that the main app successfully
                        integrates with the shared UI component workspace.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Theme System Test</CardTitle>
                            <CardDescription>
                                Dark/light mode switching with smooth
                                transitions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Current theme settings:</Label>
                                <div className="p-3 bg-muted rounded">
                                    <p className="text-sm">
                                        Theme preference:{' '}
                                        <Badge variant="outline">{theme}</Badge>
                                    </p>
                                    <p className="text-sm">
                                        Resolved theme:{' '}
                                        <Badge variant="outline">
                                            {resolvedTheme}
                                        </Badge>
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm font-medium">
                                    Test theme switching:
                                </p>
                                <div className="flex gap-2">
                                    <SimpleThemeToggle />
                                    <ThemeToggle />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Component Integration Test</CardTitle>
                            <CardDescription>
                                Various shadcn/ui components working together
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="test-input">Sample Input</Label>
                                <Input
                                    id="test-input"
                                    placeholder="Type something here..."
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button>Primary Button</Button>
                                <Button variant="outline">Secondary</Button>
                                <Button variant="ghost">Ghost</Button>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                <Badge>Default</Badge>
                                <Badge variant="secondary">Secondary</Badge>
                                <Badge variant="destructive">Destructive</Badge>
                                <Badge variant="outline">Outline</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>CN Utility Function</CardTitle>
                            <CardDescription>
                                Testing the cn utility from shared workspace
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div
                                className={cn(
                                    'p-4 rounded border-2 transition-colors',
                                    'bg-primary/10 border-primary/20 hover:bg-primary/20',
                                    'text-primary'
                                )}
                            >
                                This div uses the `cn()` utility function from
                                the shared workspace to merge Tailwind classes
                                properly. The fact that you can see these styles
                                means the lib/utils import is working!
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Integration Status</CardTitle>
                            <CardDescription>
                                Verification of all integration requirements
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                                    >
                                        ✅ Workspace dependency
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        @cbnsndwch/struktura-shared-ui workspace
                                        dependency configured
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                                    >
                                        ✅ CSS imports
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Global styles imported in app.css
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                                    >
                                        ✅ Component imports
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Components successfully imported and
                                        rendering
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                                    >
                                        ✅ Utility functions
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        lib/utils.js (cn function) working
                                        properly
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                                    >
                                        ✅ Build system
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Vite correctly resolves workspace
                                        dependencies
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                                    >
                                        ✅ TypeScript
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Type imports resolve correctly
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                                    >
                                        ✅ Theme system
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Dark/light mode with smooth transitions
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                        <strong>Integration Complete!</strong> The main app can
                        now:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li>
                            • Import components from the shared UI workspace
                        </li>
                        <li>
                            • Use utility functions like cn() for class merging
                        </li>
                        <li>• Build successfully with all dependencies</li>
                        <li>• Maintain proper TypeScript type checking</li>
                        <li>• Support hot reload during development</li>
                        <li>
                            • Switch between light and dark themes seamlessly
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
