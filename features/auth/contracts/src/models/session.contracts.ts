export interface ISession {
    user: IUser;
    tokens: IUserTokens;
}

export interface IUser {
    id: string;
    email: string;
    name: string;
    isVerified: boolean;
    timezone?: string;
    language?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
}
