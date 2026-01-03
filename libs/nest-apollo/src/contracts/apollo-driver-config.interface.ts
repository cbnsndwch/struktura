import type { ApolloServerOptionsWithTypeDefs } from '@apollo/server';
import type {
    GqlModuleAsyncOptions,
    GqlModuleOptions,
    GqlOptionsFactory
} from '@nestjs/graphql';

/**
 *  @publicApi
 */
export interface ServerRegistration {
    /**
     * Path to mount GraphQL API
     */
    path?: string;
}

/**
 *  @publicApi
 */
export interface ApolloDriverConfig
    extends
        Omit<
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ApolloServerOptionsWithTypeDefs<any>,
            'typeDefs' | 'schema' | 'resolvers' | 'gateway'
        >,
        ServerRegistration,
        GqlModuleOptions {
    /**
     * If enabled, will register a global interceptor that automatically maps
     * "HttpException" class instances to corresponding Apollo errors.
     * @default true
     */
    autoTransformHttpErrors?: boolean;
}

export type ApolloDriverConfigFactory = GqlOptionsFactory<ApolloDriverConfig>;
export type ApolloDriverAsyncConfig = GqlModuleAsyncOptions<ApolloDriverConfig>;
