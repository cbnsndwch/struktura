/* eslint-disable @typescript-eslint/no-explicit-any */
export type ThemePreference = 'light' | 'dark' | 'system';

/**
 * Notification preferences for the user
 */
export interface INotificationPreferences {
    /**
     * Enable or disable all email notifications
     */
    emailNotifications: boolean;

    /**
     * Receive notifications about workspace updates
     */
    workspaceUpdates: boolean;

    /**
     * Receive notifications when someone mentions or shares with you
     */
    collaborationNotifications: boolean;

    /**
     * Receive marketing and product update emails
     */
    marketingEmails: boolean;
}

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

    /**
     * Notification preferences
     */
    notifications?: INotificationPreferences;

    // Future: language, timezone, etc.
    [key: string]: any;
}
