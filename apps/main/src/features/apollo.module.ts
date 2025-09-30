import { ApolloServerPluginLandingPageLocalDefault as ApolloLandingPagePlugin } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';

export const apolloModule = GraphQLModule.forRootAsync<ApolloDriverConfig>({
    driver: ApolloDriver,
    useFactory: async () => {
        const shouldIncludePlayground =
            process.env.GRAPHQL_PLAYGROUND !== 'false';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const plugins: any[] = [];
        if (shouldIncludePlayground) {
            plugins.push(
                ApolloLandingPagePlugin({
                    footer: false,
                    embed: true
                })
            );
        }

        return {
            cache: 'bounded',
            autoSchemaFile: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            playground: 0 as any,
            introspection: shouldIncludePlayground,
            debug: shouldIncludePlayground,
            plugins
        };
    }
});
