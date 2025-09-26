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
