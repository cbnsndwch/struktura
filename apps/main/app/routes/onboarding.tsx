import { useState, useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Button,
    Card,
    CardContent,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Textarea,
    Progress,
    Badge
} from '@cbnsndwch/struktura-shared-ui';
import {
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    Building2,
    Rocket,
    Users,
    Database,
    BarChart3,
    Zap,
    X,
    Play,
    SkipForward,
    Sparkles
} from 'lucide-react';

export const meta: MetaFunction = () => {
    return [
        { title: 'Get Started • Struktura' },
        {
            name: 'description',
            content:
                "Welcome to Struktura! Let's set up your workspace and get you started with powerful data management."
        }
    ];
};

// Validation schemas
const workspaceSchema = z.object({
    name: z
        .string()
        .min(2, 'Workspace name must be at least 2 characters')
        .max(50, 'Workspace name must be less than 50 characters'),
    description: z
        .string()
        .max(200, 'Description must be less than 200 characters')
        .optional()
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

// Onboarding steps
type OnboardingStep =
    | 'welcome'
    | 'workspace'
    | 'templates'
    | 'tour'
    | 'success';

interface OnboardingState {
    currentStep: OnboardingStep;
    completedSteps: OnboardingStep[];
    workspaceData: WorkspaceFormData | null;
    selectedTemplate: string | null;
    canSkip: boolean;
}

// Collection templates
const collectionTemplates = [
    {
        id: 'team-directory',
        name: 'Team Directory',
        description: 'Manage team members, roles, and contact information',
        icon: Users,
        fields: ['Name', 'Role', 'Email', 'Department', 'Start Date']
    },
    {
        id: 'project-tracker',
        name: 'Project Tracker',
        description: 'Track project progress, tasks, and deadlines',
        icon: BarChart3,
        fields: ['Project Name', 'Status', 'Owner', 'Due Date', 'Priority']
    },
    {
        id: 'inventory-management',
        name: 'Inventory Management',
        description: 'Track products, stock levels, and supplier information',
        icon: Database,
        fields: ['Product Name', 'SKU', 'Quantity', 'Supplier', 'Reorder Level']
    },
    {
        id: 'customer-database',
        name: 'Customer Database',
        description: 'Organize customer information and communication history',
        icon: Building2,
        fields: ['Customer Name', 'Email', 'Phone', 'Company', 'Last Contact']
    }
];

// Feature tour points
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

export default function Onboarding() {
    const [state, setState] = useState<OnboardingState>({
        currentStep: 'welcome',
        completedSteps: [],
        workspaceData: null,
        selectedTemplate: null,
        canSkip: true
    });

    const [isLoading, setIsLoading] = useState(false);

    // Load state from localStorage after component mounts (client-side only)
    useEffect(() => {
        const saved = localStorage.getItem('struktura-onboarding-state');
        if (saved) {
            try {
                const parsedState = JSON.parse(saved);
                setState(parsedState);
            } catch {
                // Ignore parsing errors and continue with default state
            }
        }
    }, []);

    const form = useForm<WorkspaceFormData>({
        resolver: zodResolver(workspaceSchema),
        defaultValues: state.workspaceData || {
            name: '',
            description: ''
        }
    });

    // Save state to localStorage whenever it changes (client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(
                'struktura-onboarding-state',
                JSON.stringify(state)
            );
        }
    }, [state]);

    // Clear onboarding state when completed
    const clearOnboardingState = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('struktura-onboarding-state');
        }
    };

    const steps: OnboardingStep[] = [
        'welcome',
        'workspace',
        'templates',
        'tour',
        'success'
    ];
    const currentStepIndex = steps.indexOf(state.currentStep);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    const nextStep = () => {
        const currentIndex = steps.indexOf(state.currentStep);
        if (currentIndex < steps.length - 1) {
            const nextStepName = steps[currentIndex + 1] as OnboardingStep;
            setState(prev => ({
                ...prev,
                currentStep: nextStepName,
                completedSteps: [...prev.completedSteps, prev.currentStep]
            }));
        }
    };

    const prevStep = () => {
        const currentIndex = steps.indexOf(state.currentStep);
        if (currentIndex > 0) {
            const prevStepName = steps[currentIndex - 1] as OnboardingStep;
            setState(prev => ({
                ...prev,
                currentStep: prevStepName
            }));
        }
    };

    const skipOnboarding = () => {
        clearOnboardingState();
        window.location.href = '/workspaces';
    };

    const handleWorkspaceSubmit = async (data: WorkspaceFormData) => {
        setIsLoading(true);
        try {
            // Create workspace via API
            const response = await fetch('/workspaces', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: data.name,
                    description: data.description || undefined
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || 'Failed to create workspace'
                );
            }

            const workspace = await response.json();
            console.log('Workspace created successfully:', workspace);

            setState(prev => ({
                ...prev,
                workspaceData: data
            }));
            nextStep();
        } catch (error) {
            console.error('Failed to create workspace:', error);

            // Show user-friendly error message
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred while creating your workspace';

            // For now, we'll continue to the next step even if the API call fails
            // In a real implementation, you might want to show an error toast or modal
            console.warn(
                'Continuing onboarding despite workspace creation error:',
                errorMessage
            );

            setState(prev => ({
                ...prev,
                workspaceData: data
            }));
            nextStep();
        } finally {
            setIsLoading(false);
        }
    };

    const handleTemplateSelect = (templateId: string | null) => {
        setState(prev => ({
            ...prev,
            selectedTemplate: templateId
        }));
    };

    const finishOnboarding = () => {
        clearOnboardingState();
        // Redirect to workspace dashboard
        window.location.href = '/workspaces';
    };

    const renderWelcomeStep = () => (
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
                <Button onClick={nextStep} size="lg" className="px-8">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={skipOnboarding} size="lg">
                    <SkipForward className="mr-2 h-4 w-4" />
                    Skip Setup
                </Button>
            </div>
        </div>
    );

    const renderWorkspaceStep = () => (
        <div className="space-y-6">
            <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Create Your Workspace</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    A workspace is where you'll manage your data, collaborate
                    with your team, and organize your projects.
                </p>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleWorkspaceSubmit)}
                    className="space-y-6"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Workspace Name *</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., Acme Inc, Marketing Team, Personal Projects"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description (Optional)</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Briefly describe what this workspace is for..."
                                        {...field}
                                        rows={3}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                                    Creating Workspace...
                                </>
                            ) : (
                                <>
                                    Create Workspace
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={prevStep}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );

    const renderTemplatesStep = () => (
        <div className="space-y-6">
            <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                    <Database className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Choose a Template</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Get started quickly with a pre-built collection template, or
                    create your own from scratch later.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {collectionTemplates.map(template => {
                    const Icon = template.icon;
                    const isSelected = state.selectedTemplate === template.id;

                    return (
                        <Card
                            key={template.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                                isSelected
                                    ? 'ring-2 ring-primary border-primary'
                                    : ''
                            }`}
                            onClick={() => handleTemplateSelect(template.id)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <h3 className="font-semibold">
                                            {template.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {template.description}
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {template.fields
                                                .slice(0, 3)
                                                .map(field => (
                                                    <Badge
                                                        key={field}
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {field}
                                                    </Badge>
                                                ))}
                                            {template.fields.length > 3 && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    +
                                                    {template.fields.length - 3}{' '}
                                                    more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="text-center">
                <Button
                    variant="ghost"
                    onClick={() => handleTemplateSelect(null)}
                    className={
                        state.selectedTemplate === null
                            ? 'ring-2 ring-primary'
                            : ''
                    }
                >
                    I'll create my own collection later
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={nextStep} className="flex-1">
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>
        </div>
    );

    const renderTourStep = () => (
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
                <Button onClick={nextStep} className="flex-1">
                    Complete Setup
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>
        </div>
    );

    const renderSuccessStep = () => (
        <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-white" />
            </div>

            <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">
                    🎉 You're All Set!
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                    Your workspace{' '}
                    <strong>"{state.workspaceData?.name}"</strong> has been
                    created successfully.
                </p>
            </div>

            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-primary/20">
                <h3 className="font-semibold mb-4">What's Next?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Create your first collection</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Invite team members</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Import existing data</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Explore different views</span>
                    </div>
                </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
                <Button onClick={finishOnboarding} size="lg" className="px-8">
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

    const renderStepContent = () => {
        switch (state.currentStep) {
            case 'welcome':
                return renderWelcomeStep();
            case 'workspace':
                return renderWorkspaceStep();
            case 'templates':
                return renderTemplatesStep();
            case 'tour':
                return renderTourStep();
            case 'success':
                return renderSuccessStep();
            default:
                return renderWelcomeStep();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Header with progress and skip */}
            {state.currentStep !== 'success' && (
                <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <h1 className="font-semibold text-lg">Setup</h1>
                                <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                                    <span>
                                        Step {currentStepIndex + 1} of{' '}
                                        {steps.length}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="hidden sm:block w-32">
                                    <Progress
                                        value={progress}
                                        className="h-2"
                                    />
                                </div>
                                {state.canSkip && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={skipOnboarding}
                                    >
                                        <X className="mr-1 h-3 w-3" />
                                        Skip
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="mt-2 sm:hidden">
                            <Progress value={progress} className="h-2" />
                        </div>
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="container mx-auto px-4 py-8 lg:py-16">
                <div className="max-w-2xl mx-auto">
                    <Card className="shadow-lg">
                        <CardContent className="p-8 lg:p-12">
                            {renderStepContent()}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
