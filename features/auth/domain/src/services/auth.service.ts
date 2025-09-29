import * as crypto from 'crypto';

import {
    BadRequestException,
    ConflictException,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';

import {
    LoginDto,
    RefreshTokenDto,
    RegisterDto,
    RequestPasswordResetDto,
    ResetPasswordDto,
    UpdatePreferencesDto
} from '../dto/index.js';
import {
    RefreshToken,
    RefreshTokenDocument
} from '../entities/refresh-token.entity.js';
import { User, UserDocument } from '../entities/user.entity.js';

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
        roles: string[];
        emailVerified: boolean;
    };
    tokens: AuthTokens;
}

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(RefreshToken.name)
        private refreshTokenModel: Model<RefreshTokenDocument>,
        private jwtService: JwtService
    ) {}

    async register(
        registerDto: RegisterDto
    ): Promise<{ message: string; userId: string }> {
        const { email, name, password, timezone, language } = registerDto;

        // Check if user already exists
        const existingUser = await this.userModel.findOne({ email }).lean();
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Generate email verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const emailVerificationExpires = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        ); // 24 hours

        // Create user
        const user = new this.userModel({
            email,
            name,
            passwordHash,
            emailVerificationToken,
            emailVerificationExpires,
            profile: {
                timezone,
                language: language || 'en'
            }
        });

        await user.save();

        // TODO: Send verification email
        // await this.emailService.sendVerificationEmail(email, name, emailVerificationToken);

        return {
            message:
                'Registration successful. Please check your email to verify your account.',
            userId: (user._id as mongoose.Types.ObjectId).toString()
        };
    }

    async login(
        loginDto: LoginDto,
        userAgent?: string,
        ipAddress?: string
    ): Promise<AuthResponse> {
        const { email, password } = loginDto;

        // Find user by email
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
        );
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if email is verified
        if (!user.emailVerified) {
            throw new UnauthorizedException(
                'Please verify your email before logging in. Check your inbox for verification link.'
            );
        }

        // Update last login
        user.lastLoginAt = new Date();
        await user.save();

        // Generate tokens
        const tokens = await this.generateTokens(user, userAgent, ipAddress);

        return {
            user: {
                id: (user._id as mongoose.Types.ObjectId).toString(),
                email: user.email,
                name: user.name,
                roles: user.roles,
                emailVerified: user.emailVerified
            },
            tokens
        };
    }

    async verifyEmail(token: string): Promise<{ message: string }> {
        const user = await this.userModel.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: new Date() }
        });

        if (!user) {
            throw new BadRequestException(
                'Invalid or expired verification token'
            );
        }

        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        return { message: 'Email verified successfully' };
    }

    async requestPasswordReset(
        dto: RequestPasswordResetDto
    ): Promise<{ message: string }> {
        const { email } = dto;

        const user = await this.userModel.findOne({ email });
        if (!user) {
            // Don't reveal if email exists or not
            return {
                message:
                    'If an account with that email exists, we sent a password reset link'
            };
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        user.passwordResetToken = resetToken;
        user.passwordResetExpires = resetExpires;
        await user.save();

        // TODO: Send password reset email
        // await this.emailService.sendPasswordResetEmail(email, user.name, resetToken);

        return {
            message:
                'If an account with that email exists, we sent a password reset link'
        };
    }

    async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
        const { token, newPassword } = dto;

        const user = await this.userModel.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() }
        });

        if (!user) {
            throw new BadRequestException('Invalid or expired reset token');
        }

        // Hash new password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        // Update user
        user.passwordHash = passwordHash;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // Revoke all refresh tokens for this user
        await this.refreshTokenModel.updateMany(
            { userId: user._id },
            { revoked: true }
        );

        return { message: 'Password reset successfully' };
    }

    async refreshTokens(
        dto: RefreshTokenDto,
        userAgent?: string,
        ipAddress?: string
    ): Promise<AuthTokens> {
        const { refreshToken } = dto;

        // Find and validate refresh token
        const tokenDoc = await this.refreshTokenModel
            .findOne({
                token: refreshToken,
                revoked: false,
                expiresAt: { $gt: new Date() }
            })
            .populate('userId');

        if (!tokenDoc) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        // Get user
        const user = await this.userModel.findById(tokenDoc.userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Revoke the old refresh token
        tokenDoc.revoked = true;
        await tokenDoc.save();

        // Generate new tokens
        return this.generateTokens(user, userAgent, ipAddress);
    }

    async logout(refreshToken: string): Promise<{ message: string }> {
        // Revoke the refresh token
        await this.refreshTokenModel.updateOne(
            { token: refreshToken },
            { revoked: true }
        );

        return { message: 'Logged out successfully' };
    }

    async validateUser(userId: string): Promise<User | null> {
        return this.userModel.findById(userId).lean();
    }

    async generateTokens(
        user: UserDocument,
        userAgent?: string,
        ipAddress?: string
    ): Promise<AuthTokens> {
        const payload = {
            sub: (user._id as mongoose.Types.ObjectId).toString(),
            email: user.email,
            roles: user.roles
        };

        // Generate access token (15 minutes)
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '15m'
        });

        // Generate refresh token (7 days)
        const refreshTokenString = crypto.randomBytes(64).toString('hex');
        const refreshTokenExpires = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        ); // 7 days

        // Save refresh token
        const refreshToken = new this.refreshTokenModel({
            userId: user._id,
            token: refreshTokenString,
            expiresAt: refreshTokenExpires,
            userAgent,
            ipAddress
        });
        await refreshToken.save();

        return {
            accessToken,
            refreshToken: refreshTokenString,
            expiresIn: 15 * 60 // 15 minutes in seconds
        };
    }

    /**
     * Update user preferences
     */
    async updatePreferences(
        userId: string,
        dto: UpdatePreferencesDto
    ): Promise<User> {
        const user = await this.userModel.findById(userId);

        if (!user) {
            throw new BadRequestException('User not found');
        }

        // Initialize preferences if not exists
        if (!user.preferences) {
            user.preferences = { theme: 'system' };
        }

        // Update only provided fields
        if (dto.theme !== undefined) {
            user.preferences.theme = dto.theme;
        }

        await user.save();
        return user;
    }

    /**
     * Get user preferences
     */
    async getPreferences(userId: string): Promise<User['preferences']> {
        const user = await this.userModel
            .findById(userId)
            .select('preferences');

        if (!user) {
            throw new BadRequestException('User not found');
        }

        // Return default preferences if none exist
        return user.preferences || { theme: 'system' };
    }
}
