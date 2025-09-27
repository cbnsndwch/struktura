import type { IUser, IUserTokens } from '../models/session.contracts.js';
import type { ITokenPayload } from '../models/tokens.contracts.js';

export interface ITokenService {
    generateTokens(user: IUser): Promise<IUserTokens>;
    refreshTokens(refreshToken: string): Promise<IUserTokens>;
    validateToken(token: string): Promise<ITokenPayload>;
    revokeTokens(userId: string): Promise<void>;
}
