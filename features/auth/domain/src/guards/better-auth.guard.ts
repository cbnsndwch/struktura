/**
 * Better Auth Guard for NestJS
 *
 * This guard validates session tokens from Better Auth and attaches
 * the user to the request for use in route handlers.
 *
 * Usage:
 * @UseGuards(BetterAuthGuard)
 * @Get('profile')
 * getProfile(@CurrentUser() user: BetterAuthUser) { ... }
 */
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';

import { getAuth } from '../better-auth/auth.js';

/**
 * Better Auth user type attached to requests
 */
export interface BetterAuthUser {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
    roles?: string | null;
    /** JSON-stringified user preferences */
    preferences?: string | null;
}

/**
 * Better Auth session type attached to requests
 */
export interface BetterAuthSession {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Extended request type with Better Auth properties
 */
export interface BetterAuthRequest extends Request {
    betterAuthUser?: BetterAuthUser;
    betterAuthSession?: BetterAuthSession;
}

@Injectable()
export class BetterAuthGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Check if route is marked as public
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass()
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<BetterAuthRequest>();

        try {
            // Get the auth instance (must be initialized first)
            const auth = getAuth();

            // Get session from Better Auth using request headers
            const session = await auth.api.getSession({
                headers: fromNodeHeaders(request.headers)
            });

            if (!session || !session.user) {
                throw new UnauthorizedException('Invalid or expired session');
            }

            // Attach user and session to request for downstream use
            // Using dedicated properties to avoid conflicts with other middleware
            request.betterAuthUser = session.user;
            request.betterAuthSession = session.session;

            return true;
        } catch {
            throw new UnauthorizedException('Authentication required');
        }
    }
}
