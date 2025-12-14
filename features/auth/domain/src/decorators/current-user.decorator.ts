import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { IUser } from '@cbnsndwch/struktura-auth-contracts';

import type { BetterAuthRequest } from '../guards/better-auth.guard.js';

/**
 * Parameter decorator to extract the Better Auth user from the request.
 * Only works with routes protected by BetterAuthGuard.
 */
export const CurrentUser = createParamDecorator(
    (data: keyof IUser | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<BetterAuthRequest>();
        const user = request.user;

        // If a specific property is requested, return just that property
        if (data && user) {
            return user[data];
        }

        return user;
    }
);

/**
 * Parameter decorator to extract just the Better Auth user ID.
 * Convenience decorator equivalent to @BetterAuthCurrentUser('id')
 */
export const UserId = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<BetterAuthRequest>();
        return request.user?.id;
    }
);

/**
 * Parameter decorator to extract the Better Auth session from the request.
 */
export const CurrentSession = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<BetterAuthRequest>();
        return request.session;
    }
);
