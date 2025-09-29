import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import Onboarding from './onboarding.js';

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock localStorage for SSR compatibility
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

// Mock window.location
Object.defineProperty(window, 'location', {
    value: {
        href: ''
    },
    writable: true
});

describe('Onboarding Wizard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
        // Mock successful API response
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ id: 'workspace-123', name: 'Test Workspace' })
        });
    });

    it('renders welcome step by default', () => {
        render(<Onboarding />);

        expect(screen.getByText('Welcome to Struktura!')).toBeInTheDocument();
        expect(
            screen.getByText(/Let's get you set up with your first workspace/)
        ).toBeInTheDocument();
        expect(screen.getByText('Get Started')).toBeInTheDocument();
        expect(screen.getByText('Skip Setup')).toBeInTheDocument();
    });

    it('shows progress indicator', () => {
        render(<Onboarding />);

        expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
    });

    it('displays feature overview cards', () => {
        render(<Onboarding />);

        expect(
            screen.getByText('Flexible Data Management')
        ).toBeInTheDocument();
        expect(screen.getByText('Real-time Collaboration')).toBeInTheDocument();
        expect(screen.getByText('Multiple Views')).toBeInTheDocument();
        expect(screen.getByText('Powerful Integrations')).toBeInTheDocument();
    });

    it('navigates to workspace creation step when Get Started is clicked', () => {
        render(<Onboarding />);

        const getStartedButton = screen.getByText('Get Started');
        fireEvent.click(getStartedButton);

        expect(screen.getByText('Create Your Workspace')).toBeInTheDocument();
        expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
    });

    it('can navigate backwards', () => {
        render(<Onboarding />);

        // Go to step 2
        fireEvent.click(screen.getByText('Get Started'));
        expect(screen.getByText('Create Your Workspace')).toBeInTheDocument();

        // Go back to step 1
        fireEvent.click(screen.getByText('Back'));
        expect(screen.getByText('Welcome to Struktura!')).toBeInTheDocument();
    });

    it('validates workspace form', async () => {
        render(<Onboarding />);

        fireEvent.click(screen.getByText('Get Started'));

        const createButton = screen.getByText('Create Workspace');
        fireEvent.click(createButton);

        // Should show validation error for empty name
        await waitFor(() => {
            expect(
                screen.getByText('Workspace name must be at least 2 characters')
            ).toBeInTheDocument();
        });
    });

    it('proceeds to templates step after workspace creation', async () => {
        render(<Onboarding />);

        fireEvent.click(screen.getByText('Get Started'));

        const nameInput = screen.getByPlaceholderText(
            'e.g., Acme Inc, Marketing Team, Personal Projects'
        );
        fireEvent.change(nameInput, { target: { value: 'Test Workspace' } });

        const createButton = screen.getByText('Create Workspace');
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(screen.getByText('Choose a Template')).toBeInTheDocument();
            expect(screen.getByText('Step 3 of 5')).toBeInTheDocument();
        });
    });

    it('displays collection templates', () => {
        render(<Onboarding />);

        // Navigate to templates step
        fireEvent.click(screen.getByText('Get Started'));

        const nameInput = screen.getByPlaceholderText(
            'e.g., Acme Inc, Marketing Team, Personal Projects'
        );
        fireEvent.change(nameInput, { target: { value: 'Test Workspace' } });
        fireEvent.click(screen.getByText('Create Workspace'));

        waitFor(() => {
            expect(screen.getByText('Team Directory')).toBeInTheDocument();
            expect(screen.getByText('Project Tracker')).toBeInTheDocument();
            expect(
                screen.getByText('Inventory Management')
            ).toBeInTheDocument();
            expect(screen.getByText('Customer Database')).toBeInTheDocument();
        });
    });

    it('allows skipping the onboarding', () => {
        render(<Onboarding />);

        const skipButton = screen.getByText('Skip');
        fireEvent.click(skipButton);

        expect(window.location.href).toBe('/workspaces');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(
            'struktura-onboarding-state'
        );
    });

    it('saves and restores onboarding state', async () => {
        // Mock saved state
        const savedState = JSON.stringify({
            currentStep: 'workspace',
            completedSteps: ['welcome'],
            workspaceData: { name: 'Saved Workspace', description: '' },
            selectedTemplate: null,
            canSkip: true
        });
        localStorageMock.getItem.mockReturnValue(savedState);

        render(<Onboarding />);

        // Should restore to workspace step after loading
        await waitFor(() => {
            expect(
                screen.getByText('Create Your Workspace')
            ).toBeInTheDocument();
        });
    });

    it('handles localStorage parsing errors gracefully', () => {
        localStorageMock.getItem.mockReturnValue('invalid json');

        expect(() => render(<Onboarding />)).not.toThrow();
        expect(screen.getByText('Welcome to Struktura!')).toBeInTheDocument();
    });

    it('is mobile responsive', () => {
        // Mock mobile viewport
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 375
        });

        render(<Onboarding />);

        // Progress should still be visible but in different layout
        expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
        expect(screen.getAllByRole('progressbar')).toHaveLength(2); // One for desktop, one for mobile
    });
});
