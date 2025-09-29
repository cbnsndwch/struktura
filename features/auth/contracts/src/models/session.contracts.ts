export interface ISession {
    user: IUser;
    tokens: IUserTokens;
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    // Future: notifications, language, etc.
}

export interface IUser {
    id: string;
    email: string;
    name: string;
    isVerified: boolean;
    timezone?: string;
    language?: string;
    preferences?: UserPreferences;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
}
