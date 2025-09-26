import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { AppResolver } from './graphql/app.resolver.js';

@Module({
    imports: [
        DatabaseModule,
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: true,
            playground: process.env.GRAPHQL_PLAYGROUND !== 'false',
            introspection: process.env.GRAPHQL_INTROSPECTION !== 'false'
        })
    ],
    controllers: [AppController],
    providers: [AppService, AppResolver]
})
export class AppModule {}
