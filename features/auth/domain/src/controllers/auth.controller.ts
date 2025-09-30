import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Put,
    Query,
    Req,
    Res,
    UseGuards
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import {
    AuthService,
    AuthResponse,
    AuthTokens
} from '../services/auth.service.js';
import { User } from '../entities/user.entity.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { Public } from '../decorators/public.decorator.js';
import {
    LoginDto,
    RefreshTokenDto,
    RegisterDto,
    RequestPasswordResetDto,
    ResetPasswordDto,
    UpdatePreferencesDto
} from '../dto/index.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';

@Controller('api/auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(
        @Body() registerDto: RegisterDto
    ): Promise<{ message: string; userId: string }> {
        return this.authService.register(registerDto);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ): Promise<AuthResponse> {
        const userAgent = req.get('User-Agent');
        const ipAddress = req.ip;
        const result = await this.authService.login(
            loginDto,
            userAgent,
            ipAddress
        );

        // Set HTTP-only cookies for server-side auth
        this.setCookies(res, result.tokens);

        return result;
    }

    @Public()
    @Get('verify-email')
    async verifyEmail(
        @Query('token') token: string
    ): Promise<{ message: string }> {
        return this.authService.verifyEmail(token);
    }

    @Public()
    @Post('request-password-reset')
    @HttpCode(HttpStatus.OK)
    async requestPasswordReset(
        @Body() dto: RequestPasswordResetDto
    ): Promise<{ message: string }> {
        return this.authService.requestPasswordReset(dto);
    }

    @Public()
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(
        @Body() dto: ResetPasswordDto
    ): Promise<{ message: string }> {
        return this.authService.resetPassword(dto);
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshTokens(
        @Body() dto: RefreshTokenDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ): Promise<AuthTokens> {
        const userAgent = req.get('User-Agent');
        const ipAddress = req.ip;
        const tokens = await this.authService.refreshTokens(
            dto,
            userAgent,
            ipAddress
        );

        // Set HTTP-only cookies for server-side auth
        this.setCookies(res, tokens);

        return tokens;
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async logout(
        @Body() dto: RefreshTokenDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<{ message: string }> {
        const result = await this.authService.logout(dto.refreshToken);

        // Clear authentication cookies
        this.clearCookies(res);

        return result;
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    getProfile(@CurrentUser() user: User): User {
        return user;
    }

    // OAuth Google - Temporarily disabled
    // @Public()
    // @Get('google')
    // @UseGuards(AuthGuard('google'))
    // async googleAuth(): Promise<void> {
    //     // Initiates Google OAuth flow
    // }

    // @Public()
    // @Get('google/callback')
    // @UseGuards(AuthGuard('google'))
    // async googleAuthRedirect(@Req() req: Request, @Res() res: Response): Promise<void> {
    //     interface GoogleUser {
    //         id: string;
    //         email: string;
    //         roles?: string[];
    //     }
    //     const user = req.user as GoogleUser;

    //     // Create a temporary user object to generate tokens
    //     const userDoc: Pick<User, '_id' | 'email' | 'roles'> = {
    //         _id: user.id,
    //         email: user.email,
    //         roles: user.roles || ['editor']
    //     };

    //     // Generate JWT tokens for OAuth user
    //     const tokens = await this.authService.generateTokens(
    //         userDoc,
    //         req.get('User-Agent'),
    //         req.ip
    //     );

    //     // Redirect to frontend with tokens
    //     const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${tokens.accessToken}&refresh=${tokens.refreshToken}`;
    //     res.redirect(redirectUrl);
    // }

    // OAuth GitHub - Temporarily disabled
    // @Public()
    // @Get('github')
    // @UseGuards(AuthGuard('github'))
    // async githubAuth(): Promise<void> {
    //     // Initiates GitHub OAuth flow
    // }

    // @Public()
    // @Get('github/callback')
    // @UseGuards(AuthGuard('github'))
    // async githubAuthRedirect(@Req() req: Request, @Res() res: Response): Promise<void> {
    //     interface GitHubUser {
    //         id: string;
    //         email: string;
    //         roles?: string[];
    //     }
    //     const user = req.user as GitHubUser;

    //     // Create a temporary user object to generate tokens
    //     const userDoc: Pick<User, '_id' | 'email' | 'roles'> = {
    //         _id: user.id,
    //         email: user.email,
    //         roles: user.roles || ['editor']
    //     };

    //     // Generate JWT tokens for OAuth user
    //     const tokens = await this.authService.generateTokens(
    //         userDoc,
    //         req.get('User-Agent'),
    //         req.ip
    //     );

    //     // Redirect to frontend with tokens
    //     const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${tokens.accessToken}&refresh=${tokens.refreshToken}`;
    //     res.redirect(redirectUrl);
    // }

    /**
     * Get user preferences
     */
    @Get('preferences')
    @UseGuards(JwtAuthGuard)
    async getPreferences(
        @CurrentUser() user: User
    ): Promise<User['preferences']> {
        return this.authService.getPreferences(user.id);
    }

    /**
     * Update user preferences
     */
    @Put('preferences')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async updatePreferences(
        @CurrentUser() user: User,
        @Body() dto: UpdatePreferencesDto
    ): Promise<ReturnType<User['toPublicData']>> {
        const updatedUser = await this.authService.updatePreferences(
            user.id,
            dto
        );
        return updatedUser.toPublicData();
    }

    /**
     * Set authentication cookies
     */
    private setCookies(res: Response, tokens: AuthTokens): void {
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax' as const,
            path: '/'
        };

        // Set access token cookie (expires in 15 minutes)
        res.cookie('access_token', tokens.accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        // Set refresh token cookie (expires in 7 days)
        if (tokens.refreshToken) {
            res.cookie('refresh_token', tokens.refreshToken, {
                ...cookieOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
        }
    }

    /**
     * Clear authentication cookies
     */
    private clearCookies(res: Response): void {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            path: '/'
        };

        res.clearCookie('access_token', cookieOptions);
        res.clearCookie('refresh_token', cookieOptions);
    }
}
