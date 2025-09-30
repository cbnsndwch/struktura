import { z } from 'zod';

// Validation schemas
export const workspaceSchema = z.object({
    name: z
        .string()
        .min(2, 'Workspace name must be at least 2 characters')
        .max(50, 'Workspace name must be less than 50 characters'),
    description: z
        .string()
        .max(200, 'Description must be less than 200 characters')
        .optional()
});

export type WorkspaceFormData = z.infer<typeof workspaceSchema>;

// Onboarding steps
export type OnboardingStep =
    | 'welcome'
    | 'workspace'
    | 'templates'
    | 'tour'
    | 'success';

export interface OnboardingState {
    currentStep: OnboardingStep;
    completedSteps: OnboardingStep[];
    workspaceData: WorkspaceFormData | null;
    selectedTemplate: string | null;
    canSkip: boolean;
}
