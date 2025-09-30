import { CheckCircle, Play } from 'lucide-react';

import { Button, Card } from '@cbnsndwch/struktura-shared-ui';

import { type WorkspaceFormData } from '../contracts.js';

interface SuccessStepProps {
    workspaceData: WorkspaceFormData | null;
    onFinish: () => void;
}

export default function SuccessStep({
    workspaceData,
    onFinish
}: SuccessStepProps) {
    return (
        <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-white" />
            </div>

            <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">
                    🎉 You're All Set!
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                    Your workspace <strong>"{workspaceData?.name}"</strong> has
                    been created successfully.
                </p>
            </div>

            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-primary/20 dark:border-primary/30">
                <h3 className="font-semibold mb-4">What's Next?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span>Create your first collection</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span>Invite team members</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span>Import existing data</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span>Explore different views</span>
                    </div>
                </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
                <Button onClick={onFinish} size="lg" className="px-8">
                    <Play className="mr-2 h-4 w-4" />
                    Go to My Workspace
                </Button>
            </div>

            <p className="text-xs text-muted-foreground">
                Need help getting started? Check out our{' '}
                <a href="/docs" className="underline hover:no-underline">
                    documentation
                </a>{' '}
                or{' '}
                <a href="/support" className="underline hover:no-underline">
                    contact support
                </a>
            </p>
        </div>
    );
}
