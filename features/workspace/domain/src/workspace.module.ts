import { Module } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';

import { AuthModule, MONGODB_DATABASE } from '@cbnsndwch/struktura-auth-domain';

import { Workspace, WorkspaceSchema } from './entities/index.js';
import { WorkspaceService } from './services/index.js';
import { WorkspaceController } from './controllers/index.js';
import { WorkspaceResolver } from './resolvers/index.js';
import { WorkspaceGuard } from './guards/index.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Workspace.name, schema: WorkspaceSchema }
        ]),
        AuthModule
    ],
    controllers: [WorkspaceController],
    providers: [
        // Provide MongoDB database instance from Mongoose connection
        // This is used by WorkspaceService to access the ba_user collection
        {
            provide: MONGODB_DATABASE,
            useFactory: (connection: Connection) => {
                return connection.getClient().db();
            },
            inject: [getConnectionToken()]
        },
        WorkspaceService,
        WorkspaceResolver,
        WorkspaceGuard
    ],
    exports: [WorkspaceService, WorkspaceGuard]
})
export class WorkspaceModule {}
