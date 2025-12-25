import { GraphQLModule } from '@nestjs/graphql';

import { ApolloDriver, ApolloDriverConfig } from '@cbnsndwch/nestjs-apollo';

export const apolloModule = GraphQLModule.forRootAsync<ApolloDriverConfig>({
    driver: ApolloDriver,
    useFactory: async () => {
        const isNotProd = process.env.NODE_ENV !== 'production';

        return {
            cache: 'bounded',
            autoSchemaFile: true,
            introspection: isNotProd,
            debug: isNotProd
        };
    }
});
