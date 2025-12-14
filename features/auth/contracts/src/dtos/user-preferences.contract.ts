/* eslint-disable @typescript-eslint/no-explicit-any */
export type ThemePreference = 'light' | 'dark' | 'system';

/**
 * Represents user-configurable preferences for the application.
 *
 * Defines the structure for storing user preferences such as theme settings.
 * Additional preference options like notifications and language settings may be
 * added in future versions.
 */
export interface IUserPreferences {
    /**
     * Preferred theme setting for the user interface.
     */
    theme: ThemePreference;

    // Future: notifications, language, etc.
    [key: string]: any;
}
