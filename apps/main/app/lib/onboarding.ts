/**
 * Onboarding state management utilities
 */

export interface OnboardingState {
    isActive: boolean;
    currentStep: 'welcome' | 'workspace' | 'templates' | 'tour' | 'success';
    completedSteps: string[];
    workspaceData?: {
        name: string;
        description?: string;
    };
    selectedTemplate?: string;
    canSkip: boolean;
    createdFromWorkspaceButton?: boolean; // Track if triggered from "Create Workspace" button
}

const ONBOARDING_KEY = 'struktura_onboarding_state';

/**
 * Get the current onboarding state from localStorage
 */
export function getOnboardingState(): OnboardingState | null {
    if (typeof window === 'undefined') {
        return null;
    }
    
    try {
        const stored = localStorage.getItem(ONBOARDING_KEY);
        if (!stored) return null;
        
        return JSON.parse(stored) as OnboardingState;
    } catch {
        return null;
    }
}

/**
 * Save onboarding state to localStorage
 */
export function saveOnboardingState(state: OnboardingState): void {
    if (typeof window === 'undefined') {
        return;
    }
    
    try {
        localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
    } catch (error) {
        console.warn('Failed to save onboarding state:', error);
    }
}

/**
 * Clear onboarding state (when completed or skipped)
 */
export function clearOnboardingState(): void {
    if (typeof window === 'undefined') {
        return;
    }
    
    try {
        localStorage.removeItem(ONBOARDING_KEY);
    } catch (error) {
        console.warn('Failed to clear onboarding state:', error);
    }
}

/**
 * Start onboarding flow (typically triggered by "Create Workspace" button)
 */
export function startOnboarding(fromWorkspaceButton = false): OnboardingState {
    const state: OnboardingState = {
        isActive: true,
        currentStep: 'welcome',
        completedSteps: [],
        canSkip: true,
        createdFromWorkspaceButton: fromWorkspaceButton
    };
    
    saveOnboardingState(state);
    return state;
}

/**
 * Update onboarding step
 */
export function updateOnboardingStep(
    step: OnboardingState['currentStep'],
    data?: Partial<OnboardingState>
): OnboardingState {
    const currentState = getOnboardingState();
    if (!currentState) {
        return startOnboarding();
    }
    
    const updatedState: OnboardingState = {
        ...currentState,
        currentStep: step,
        completedSteps: currentState.completedSteps.includes(currentState.currentStep)
            ? currentState.completedSteps
            : [...currentState.completedSteps, currentState.currentStep],
        ...data
    };
    
    saveOnboardingState(updatedState);
    return updatedState;
}

/**
 * Complete onboarding flow
 */
export function completeOnboarding(): void {
    clearOnboardingState();
}

/**
 * Skip onboarding flow
 */
export function skipOnboarding(): void {
    clearOnboardingState();
}

/**
 * Check if onboarding should be shown
 */
export function shouldShowOnboarding(): boolean {
    const state = getOnboardingState();
    return state?.isActive === true;
}

/**
 * Check if user has any workspaces (used to determine if onboarding should be shown for new users)
 */
export function shouldTriggerOnboardingForNewUser(workspaceCount: number): boolean {
    // If user has no workspaces and no active onboarding, they might be a new user
    return workspaceCount === 0 && !getOnboardingState();
}