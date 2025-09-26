/**
 * Shared UI components and utilities for all Struktura features
 *
 * Note: This is a placeholder for future React components.
 * In a real implementation, this would contain base UI components,
 * design system elements, and shared React utilities.
 */

// Base component props that all Struktura components should extend
export interface BaseComponentProps {
    className?: string;
    testId?: string;
}

// Common UI utilities
export class UIUtils {
    static formatDate(date: Date): string {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

    static formatDateTime(date: Date): string {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    static classNames(
        ...classes: (string | undefined | null | false)[]
    ): string {
        return classes.filter(Boolean).join(' ');
    }

    static truncateText(text: string, maxLength: number): string {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }
}

// Theme constants that can be used across all features
export const theme = {
    colors: {
        primary: '#0066cc',
        secondary: '#6c757d',
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545',
        info: '#17a2b8'
    },
    spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        xxl: '3rem'
    },
    typography: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            md: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            xxl: '1.5rem'
        }
    }
} as const;

export type Theme = typeof theme;
