/**
 * Better Auth User Decorator
 *
 * Use this decorator to get the authenticated Better Auth user
 * in route handlers protected by BetterAuthGuard.
 *
 * @example
 * ```typescript
 * @UseGuards(BetterAuthGuard)
 * @Get('profile')
 * getProfile(@BetterAuthCurrentUser() user: BetterAuthUser) {
 *   return { id: user.id, email: user.email };
 * }
 * ```
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type {
    BetterAuthRequest,
    BetterAuthUser
} from '../guards/better-auth.guard.js';

/**
 * Parameter decorator to extract the Better Auth user from the request.
 * Only works with routes protected by BetterAuthGuard.
 */
export const BetterAuthCurrentUser = createParamDecorator(
    (data: keyof BetterAuthUser | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<BetterAuthRequest>();
        const user = request.betterAuthUser;

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
export const BetterAuthUserId = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<BetterAuthRequest>();
        return request.betterAuthUser?.id;
    }
);

/**
 * Parameter decorator to extract the Better Auth session from the request.
 */
export const BetterAuthCurrentSession = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<BetterAuthRequest>();
        return request.betterAuthSession;
    }
);
