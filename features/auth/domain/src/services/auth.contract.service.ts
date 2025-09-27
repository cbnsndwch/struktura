import type {
    IAuthService,
    IConfirmPasswordResetInput,
    ILoginWithCredentialsInput,
    IRefreshTokenInput,
    IRegisterInput,
    IRequestPasswordResetInput,
    ISession,
    ITokenPayload,
    IUserService,
    IUserTokens,
    IVerifyEmailInput,
    ITokenService
} from '@cbnsndwch/struktura-auth-contracts';

import { IPasswordService } from '../../../contracts/src/services/password-service.contract.js';

export class AuthContractService implements IAuthService {
    constructor(
        private readonly userRepository: IUserService,
        private readonly tokenService: ITokenService,
        private readonly passwordService: IPasswordService
    ) {}

    async register(data: IRegisterInput): Promise<ISession> {
        // Check if user exists
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Create user
        // Note: Password hashing is delegated to the password service via userRepository
        // The repository implementation should handle password hashing internally
        const user = await this.userRepository.create({
            email: data.email,
            name: data.name,
            isVerified: false,
            timezone: data.timezone,
            language: data.language
        });

        // Generate tokens
        const tokens = await this.tokenService.generateTokens(user);

        return {
            user,
            tokens
        };
    }

    async login(credentials: ILoginWithCredentialsInput): Promise<ISession> {
        const user = await this.userRepository.findByEmail(credentials.email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        if (!user.isVerified) {
            throw new Error('Email not verified');
        }

        // Verify password (this would need to be implemented with the actual stored hash)
        const isValid = await this.passwordService.verify(
            credentials.password,
            user.id
        );
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        const tokens = await this.tokenService.generateTokens(user);

        return {
            user,
            tokens
        };
    }

    async refreshToken(data: IRefreshTokenInput): Promise<IUserTokens> {
        return this.tokenService.refreshTokens(data.refreshToken);
    }

    async requestPasswordReset(
        data: IRequestPasswordResetInput
    ): Promise<void> {
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            // Don't reveal if email exists or not
            return;
        }

        await this.passwordService.generateResetToken(user.email);
    }

    async resetPassword(data: IConfirmPasswordResetInput): Promise<void> {
        await this.passwordService.resetPassword(data.token, data.newPassword);
    }

    async verifyEmail(data: IVerifyEmailInput): Promise<void> {
        // Implementation would verify the token and mark user as verified
        throw new Error(
            `Email verification not implemented for token: ${data.token || 'unknown'}`
        );
    }

    async logout(userId: string): Promise<void> {
        await this.tokenService.revokeTokens(userId);
    }

    async validateToken(token: string): Promise<ITokenPayload> {
        return this.tokenService.validateToken(token);
    }
}
