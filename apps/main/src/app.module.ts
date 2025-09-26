/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApolloServerPluginLandingPageLocalDefault as ApolloLandingPagePlugin } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { AppResolver } from './graphql/app.resolver.js';

@Module({
    imports: [
        DatabaseModule,
        GraphQLModule.forRootAsync<ApolloDriverConfig>({
            driver: ApolloDriver,
            useFactory: async () => {
                const shouldIncludePlayground =
                    process.env.GRAPHQL_PLAYGROUND !== 'false';

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
                    playground: 0 as any,
                    introspection: shouldIncludePlayground,
                    debug: shouldIncludePlayground,
                    plugins
                };
            }
        })
    ],
    controllers: [AppController],
    providers: [AppService, AppResolver]
})
export class AppModule {}
