import {
    ArrowRight,
    SkipForward,
    Sparkles,
    Database,
    Users,
    BarChart3,
    Zap
} from 'lucide-react';

import { Button, Card } from '@cbnsndwch/struktura-shared-ui';

interface WelcomeStepProps {
    onNext: () => void;
    onSkip: () => void;
}

export default function WelcomeStep({ onNext, onSkip }: WelcomeStepProps) {
    return (
        <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-white" />
            </div>

            <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome to Struktura!
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                    Let's get you set up with your first workspace so you can
                    start building amazing data-driven workflows.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <Card className="p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Database className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold">
                                Flexible Data Management
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Create custom databases without code
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold">
                                Real-time Collaboration
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Work with your team seamlessly
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <BarChart3 className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold">Multiple Views</h3>
                            <p className="text-sm text-muted-foreground">
                                Grid, cards, calendar, and more
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Zap className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold">
                                Powerful Integrations
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Connect with your favorite tools
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
                <Button onClick={onNext} size="lg" className="px-8">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={onSkip} size="lg">
                    <SkipForward className="mr-2 h-4 w-4" />
                    Skip Setup
                </Button>
            </div>
        </div>
    );
}
