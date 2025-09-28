import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { AppTestController } from './app-test.controller.js';
import { AppService } from '../demo/app.service.js';
import { DatabaseTestModule } from './database-test.module.js';
import { AppResolver } from '../demo/app.resolver.js';

@Module({
    imports: [
        DatabaseTestModule,
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: true,
            playground: false,
            introspection: false
        })
    ],
    controllers: [AppTestController],
    providers: [AppService, AppResolver]
})
export class AppTestModule {}
