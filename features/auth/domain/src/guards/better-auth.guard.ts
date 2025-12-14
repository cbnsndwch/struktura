import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Inject
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';

import type { IUser, ISession } from '@cbnsndwch/struktura-auth-contracts';

import { type Auth, TOKEN_AUTH_SERVICE } from '../services/index.js';

/**
 * Extended request type with Better Auth properties
 */
export interface BetterAuthRequest extends Request {
    /** User object from Better Auth session */
    user?: IUser;

    /** Session object from Better Auth */
    session?: ISession;
}

/**
 * Better Auth Guard for NestJS
 *
 * This guard validates session tokens from Better Auth and attaches
 * the user to the request for use in route handlers.
 *
 * Usage:
 * @UseGuards(BetterAuthGuard)
 * @Get('profile')
 * getProfile(@BetterAuthCurrentUser() user: IBetterAuthUser) { ... }
 */
@Injectable()
export class BetterAuthGuard implements CanActivate {
    constructor(
        @Inject(TOKEN_AUTH_SERVICE)
        private readonly auth: Auth,
        private readonly reflector: Reflector
    ) {}

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
            // Get session from Better Auth using request headers
            const sessionState = await this.auth.api.getSession({
                headers: fromNodeHeaders(request.headers)
            });

            const { session, user } = sessionState || {};
            if (!user) {
                throw new UnauthorizedException('Invalid or expired session');
            }

            // Attach user and session to request for downstream use
            request.user = user as IUser;
            request.session = session;

            return true;
        } catch {
            throw new UnauthorizedException('Authentication required');
        }
    }
}
