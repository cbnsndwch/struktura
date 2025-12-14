import type { IUserPreferences } from './user-preferences.contract.js';

/**
 * User data returned from preferences operations
 */
export interface IUser {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    preferences: IUserPreferences;
    roles?: string;
    createdAt: Date;
    updatedAt: Date;
}
