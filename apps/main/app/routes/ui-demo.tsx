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
    Label
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
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Badge variant="secondary" className="mb-4">
                        🎨 UI Integration Demo (Hot Reload Test!)
                    </Badge>
                    <h1 className="text-4xl font-bold mb-4">
                        Shared UI Component Integration
                    </h1>
                    <p className="text-xl text-gray-600">
                        This page demonstrates that the main app successfully integrates 
                        with the shared UI component workspace.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
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
                                    "p-4 rounded border-2 transition-colors",
                                    "bg-blue-50 border-blue-200 hover:bg-blue-100",
                                    "text-blue-800"
                                )}
                            >
                                This div uses the `cn()` utility function from the shared 
                                workspace to merge Tailwind classes properly. The fact that 
                                you can see these styles means the lib/utils import is working!
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
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        ✅ Workspace dependency
                                    </Badge>
                                    <span className="text-sm text-gray-600">
                                        @cbnsndwch/struktura-shared-ui workspace dependency configured
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        ✅ CSS imports
                                    </Badge>
                                    <span className="text-sm text-gray-600">
                                        Global styles imported in app.css
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        ✅ Component imports
                                    </Badge>
                                    <span className="text-sm text-gray-600">
                                        Components successfully imported and rendering
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        ✅ Utility functions
                                    </Badge>
                                    <span className="text-sm text-gray-600">
                                        lib/utils.js (cn function) working properly
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        ✅ Build system
                                    </Badge>
                                    <span className="text-sm text-gray-600">
                                        Vite correctly resolves workspace dependencies
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        ✅ TypeScript
                                    </Badge>
                                    <span className="text-sm text-gray-600">
                                        Type imports resolve correctly
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                        <strong>Integration Complete!</strong> The main app can now:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                        <li>• Import components from the shared UI workspace</li>
                        <li>• Use utility functions like cn() for class merging</li>
                        <li>• Build successfully with all dependencies</li>
                        <li>• Maintain proper TypeScript type checking</li>
                        <li>• Support hot reload during development</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}