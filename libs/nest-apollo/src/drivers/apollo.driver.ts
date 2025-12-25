import { ApolloServer, type BaseContext } from '@apollo/server';
import {
    ApolloServerErrorCode,
    unwrapResolverError
} from '@apollo/server/errors';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@as-integrations/express5';
import { HttpStatus, Injectable } from '@nestjs/common';
import { isFunction } from '@nestjs/common/utils/shared.utils.js';
import { ModulesContainer } from '@nestjs/core';
import { AbstractGraphQLDriver, extend } from '@nestjs/graphql';
import type { Express } from 'express';
import { GraphQLError, GraphQLFormattedError, printSchema } from 'graphql';
import { omit } from 'lodash-es';

import { ApolloDriverConfig } from '../contracts/index.js';
import { PluginsExplorerService } from '../services/index.js';

const apolloPredefinedExceptions: Partial<Record<HttpStatus, string>> = {
    [HttpStatus.BAD_REQUEST]: ApolloServerErrorCode.BAD_REQUEST,
    [HttpStatus.UNPROCESSABLE_ENTITY]: ApolloServerErrorCode.BAD_USER_INPUT,
    [HttpStatus.UNAUTHORIZED]: 'UNAUTHENTICATED',
    [HttpStatus.FORBIDDEN]: 'FORBIDDEN'
};

/**
 *  @publicApi
 */
@Injectable()
export class ApolloDriver extends AbstractGraphQLDriver<ApolloDriverConfig> {
    private readonly pluginsExplorerService: PluginsExplorerService;
    protected apolloServer!: ApolloServer<BaseContext>;

    get instance(): ApolloServer<BaseContext> {
        return this.apolloServer;
    }

    constructor(modulesContainer: ModulesContainer) {
        super();
        this.pluginsExplorerService = new PluginsExplorerService(
            modulesContainer
        );
    }

    public async start(options: ApolloDriverConfig) {
        options.plugins = extend(
            options.plugins || [],
            this.pluginsExplorerService.explore(options)
        );

        if (options.definitions?.path && options.schema) {
            await this.graphQlFactory.generateDefinitions(
                printSchema(options.schema),
                options
            );
        }

        await this.registerServer(options);
    }

    public stop() {
        return this.apolloServer?.stop();
    }

    public async mergeDefaultOptions(
        options: ApolloDriverConfig
    ): Promise<ApolloDriverConfig> {
        let defaults: ApolloDriverConfig = {
            path: '/graphql',
            fieldResolverEnhancers: [],
            stopOnTerminationSignals: false
        };

        if (process.env.NODE_ENV === 'production') {
            defaults = {
                ...defaults,
                plugins: [ApolloServerPluginLandingPageDisabled()]
            };
        }

        options = await super.mergeDefaultOptions(
            options,
            omit(defaults, 'plugins')
        );

        (options as ApolloDriverConfig).plugins = (
            options.plugins || []
        ).concat(defaults.plugins || []);

        this.wrapContextResolver(options);
        this.wrapFormatErrorFn(options);
        return options;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public subscriptionWithFilter(..._args: unknown[]) {
        throw new Error(
            'Subscriptions are not supported in this Apollo Server driver'
        );
    }

    async registerServer(
        options: ApolloDriverConfig,
        { preStartHook }: { preStartHook?: () => void } = {}
    ) {
        const { path, typeDefs, resolvers, schema } = options;

        const httpAdapter = this.httpAdapterHost.httpAdapter;

        const app = httpAdapter.getInstance<Express>();
        const drainHttpServerPlugin = ApolloServerPluginDrainHttpServer({
            httpServer: httpAdapter.getHttpServer()
        });

        preStartHook?.();

        const plugins = options.plugins
            ? options.plugins.concat([drainHttpServerPlugin])
            : [drainHttpServerPlugin];

        const server = new ApolloServer({
            typeDefs,
            resolvers,
            schema,
            ...options,
            plugins

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any); // polymorphism hack

        await server.start();

        app.use(
            path!,
            expressMiddleware(server, {
                context: options.context
            })
        );

        this.apolloServer = server;
    }

    private wrapFormatErrorFn(options: ApolloDriverConfig) {
        if (options.autoTransformHttpErrors === false) {
            return;
        }
        if (options.formatError) {
            const origFormatError = options.formatError;
            const transformHttpErrorFn = this.createTransformHttpErrorFn();
            (options as ApolloDriverConfig).formatError = (
                formattedError: GraphQLFormattedError,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                err: any
            ) => {
                formattedError = transformHttpErrorFn(
                    formattedError,
                    err
                ) as GraphQLError;
                return origFormatError(formattedError, err);
            };
        } else {
            (options as ApolloDriverConfig).formatError =
                this.createTransformHttpErrorFn();
        }
    }

    private createTransformHttpErrorFn() {
        return (
            formattedError: GraphQLFormattedError,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            originalError: any
        ): GraphQLFormattedError => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const exceptionRef = unwrapResolverError(originalError) as any;
            const isHttpException =
                exceptionRef?.response?.statusCode && exceptionRef?.status;

            if (!isHttpException) {
                return formattedError;
            }

            let error: GraphQLError;

            const httpStatus = exceptionRef?.status as HttpStatus;
            if (httpStatus && httpStatus in apolloPredefinedExceptions) {
                error = new GraphQLError(exceptionRef?.message, {
                    path: formattedError.path,
                    extensions: {
                        ...formattedError.extensions,
                        code: apolloPredefinedExceptions[httpStatus]
                    }
                });
            } else {
                error = new GraphQLError(exceptionRef.message, {
                    path: formattedError.path,
                    extensions: {
                        ...formattedError.extensions,
                        code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
                        status: httpStatus
                    }
                });
            }
            if (exceptionRef?.response) {
                error.extensions['originalError'] = exceptionRef.response;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error as any).locations = formattedError.locations;
            return error;
        };
    }

    private wrapContextResolver(
        targetOptions: ApolloDriverConfig,
        originalOptions: ApolloDriverConfig = { ...targetOptions }
    ) {
        if (!targetOptions.context) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            targetOptions.context = async (contextOrRequest: any) => {
                return {
                    // New ApolloServer fastify integration has Request as first parameter to the Context function
                    req: contextOrRequest.req ?? contextOrRequest
                };
            };
        } else if (isFunction(targetOptions.context)) {
            targetOptions.context = async (...args: unknown[]) => {
                const ctx = await (
                    originalOptions.context as (
                        ...args: unknown[]
                    ) => Promise<unknown>
                )(...args);
                const contextOrRequest = args[0] as Record<string, unknown>;
                return this.assignReqProperty(
                    ctx as Record<string, unknown>,
                    contextOrRequest.req ?? contextOrRequest
                );
            };
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            targetOptions.context = async (contextOrRequest: any) => {
                return this.assignReqProperty(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    originalOptions.context as Record<string, any>,
                    contextOrRequest.req ?? contextOrRequest
                );
            };
        }
    }

    private assignReqProperty(
        ctx: Record<string, unknown> | undefined,
        req: unknown
    ) {
        if (!ctx) {
            return { req };
        }
        if (
            typeof ctx !== 'object' ||
            (ctx && ctx.req && typeof ctx.req === 'object')
        ) {
            return ctx;
        }
        ctx.req = req;
        return ctx;
    }
}
