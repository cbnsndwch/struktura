import {
    ArrowRight,
    ArrowLeft,
    Rocket,
    Users,
    BarChart3,
    Zap
} from 'lucide-react';

import { Button, Card } from '@cbnsndwch/struktura-shared-ui';

// Feature tour points
// TODO: read these from DB in a loader
const tourFeatures = [
    {
        title: 'Flexible Data Views',
        description:
            'Switch between grid, card, calendar, and kanban views to visualize your data the way that works best.',
        icon: BarChart3
    },
    {
        title: 'Real-time Collaboration',
        description:
            'Work together with your team in real-time. See changes instantly as they happen.',
        icon: Users
    },
    {
        title: 'Powerful API Access',
        description:
            'Connect your data to other tools with our GraphQL API and webhook integrations.',
        icon: Zap
    },
    {
        title: 'Smart Automation',
        description:
            'Set up automated workflows and triggers to save time on repetitive tasks.',
        icon: Rocket
    }
];

interface TourStepProps {
    onNext: () => void;
    onBack: () => void;
}

export default function TourStep({ onNext, onBack }: TourStepProps) {
    return (
        <div className="space-y-6">
            <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                    <Rocket className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Powerful Features</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Here are some key features that make Struktura perfect for
                    managing your data.
                </p>
            </div>

            <div className="space-y-4">
                {tourFeatures.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                        <Card key={index} className="p-4">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Icon className="h-6 w-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-lg">
                                        {feature.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <div className="text-center p-6 bg-muted/20 rounded-lg">
                <h3 className="font-semibold mb-2">Ready to explore?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    You can always access help and tutorials from your workspace
                    dashboard.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={onNext} className="flex-1">
                    Complete Setup
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>
        </div>
    );
}
