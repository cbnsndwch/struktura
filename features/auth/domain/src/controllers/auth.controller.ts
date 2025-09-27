import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Query,
    Req,
    UseGuards
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

import type { Dict } from '@cbnsndwch/struktura-shared-contracts';

import { AuthService } from '../services/auth.service.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { Public } from '../decorators/public.decorator.js';
import {
    LoginDto,
    RefreshTokenDto,
    RegisterDto,
    RequestPasswordResetDto,
    ResetPasswordDto
} from '../dto/index.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto, @Req() req: Request) {
        const userAgent = req.get('User-Agent');
        const ipAddress = req.ip;
        return this.authService.login(loginDto, userAgent, ipAddress);
    }

    @Public()
    @Get('verify-email')
    async verifyEmail(@Query('token') token: string) {
        return this.authService.verifyEmail(token);
    }

    @Public()
    @Post('request-password-reset')
    @HttpCode(HttpStatus.OK)
    async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
        return this.authService.requestPasswordReset(dto);
    }

    @Public()
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshTokens(@Body() dto: RefreshTokenDto, @Req() req: Request) {
        const userAgent = req.get('User-Agent');
        const ipAddress = req.ip;
        return this.authService.refreshTokens(dto, userAgent, ipAddress);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async logout(@Body() dto: RefreshTokenDto) {
        return this.authService.logout(dto.refreshToken);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    getProfile(@CurrentUser() user: Dict) {
        return user;
    }

    // OAuth Google - Temporarily disabled
    // @Public()
    // @Get('google')
    // @UseGuards(AuthGuard('google'))
    // async googleAuth() {
    //     // Initiates Google OAuth flow
    // }

    // @Public()
    // @Get('google/callback')
    // @UseGuards(AuthGuard('google'))
    // async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    //     const user = req.user as any;

    //     // Create a temporary user object to generate tokens
    //     const userDoc = {
    //         _id: user.id,
    //         email: user.email,
    //         roles: user.roles
    //     } as any;

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
    // async githubAuth() {
    //     // Initiates GitHub OAuth flow
    // }

    // @Public()
    // @Get('github/callback')
    // @UseGuards(AuthGuard('github'))
    // async githubAuthRedirect(@Req() req: Request, @Res() res: Response) {
    //     const user = req.user as any;

    //     // Create a temporary user object to generate tokens
    //     const userDoc = {
    //         _id: user.id,
    //         email: user.email,
    //         roles: user.roles
    //     } as any;

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
}
