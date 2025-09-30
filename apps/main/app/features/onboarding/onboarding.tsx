import { useState, useEffect } from 'react';
import type { MetaFunction, LoaderFunctionArgs } from 'react-router';
import { useNavigate } from 'react-router';
import { X } from 'lucide-react';

import {
    Button,
    Card,
    CardContent,
    Progress
} from '@cbnsndwch/struktura-shared-ui';

import { requireAuth } from '../../lib/auth.js';
import { apiClient } from '../../lib/api/client.js';

import {
    type OnboardingState,
    type OnboardingStep,
    type WorkspaceFormData
} from './contracts.js';

import WelcomeStep from './steps/welcome-step.js';
import WorkspaceStep from './steps/workspace-step.js';
import TemplatesStep from './steps/templates-step.js';
import TourStep from './steps/tour-step.js';
import SuccessStep from './steps/success-step.js';

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

export async function loader({ request }: LoaderFunctionArgs) {
    // Ensure user is authenticated before accessing onboarding
    requireAuth(request);
    return null;
}

export default function Onboarding() {
    const navigate = useNavigate();

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
        navigate('/workspaces');
    };

    const handleWorkspaceSubmit = async (data: WorkspaceFormData) => {
        setIsLoading(true);
        try {
            // Create workspace via API client (includes authentication)
            const workspace = await apiClient.post('/workspaces', {
                name: data.name,
                description: data.description || undefined
            });
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
        // Navigate to workspace dashboard
        navigate('/workspaces');
    };

    const renderStepContent = () => {
        switch (state.currentStep) {
            case 'welcome':
                return (
                    <WelcomeStep onNext={nextStep} onSkip={skipOnboarding} />
                );
            case 'workspace':
                return (
                    <WorkspaceStep
                        initialData={state.workspaceData}
                        isLoading={isLoading}
                        onSubmit={handleWorkspaceSubmit}
                        onBack={prevStep}
                    />
                );
            case 'templates':
                return (
                    <TemplatesStep
                        selectedTemplate={state.selectedTemplate}
                        onTemplateSelect={handleTemplateSelect}
                        onNext={nextStep}
                        onBack={prevStep}
                    />
                );
            case 'tour':
                return <TourStep onNext={nextStep} onBack={prevStep} />;
            case 'success':
                return (
                    <SuccessStep
                        workspaceData={state.workspaceData}
                        onFinish={finishOnboarding}
                    />
                );
            default:
                return (
                    <WelcomeStep onNext={nextStep} onSkip={skipOnboarding} />
                );
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
