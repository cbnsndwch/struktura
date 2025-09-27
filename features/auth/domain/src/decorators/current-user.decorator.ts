import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        // Check if this is a GraphQL context
        if (ctx.getType<string>() === 'graphql') {
            const gqlContext = GqlExecutionContext.create(ctx);
            const { req } = gqlContext.getContext();
            return req.user;
        }

        // Default to HTTP context
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    }
);

export const CurrentUserId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        // Check if this is a GraphQL context
        if (ctx.getType<string>() === 'graphql') {
            const gqlContext = GqlExecutionContext.create(ctx);
            const { req } = gqlContext.getContext();
            return req.user?.sub;
        }

        // Default to HTTP context
        const request = ctx.switchToHttp().getRequest();
        return request.user?.sub;
    }
);
