export interface ITokenPayload {
    sub: string;
    email: string;
    iat?: number;
    exp?: number;
}

export interface IRefreshTokenInput {
    refreshToken: string;
}
