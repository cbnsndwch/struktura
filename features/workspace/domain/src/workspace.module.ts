import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule, User, UserSchema } from '@cbnsndwch/struktura-auth-domain';

import {
    Workspace,
    WorkspaceSchema,
    Collection,
    CollectionSchema
} from './entities/index.js';
import { WorkspaceService, CollectionService } from './services/index.js';
import {
    WorkspaceController,
    CollectionController,
    CollectionTemplateController
} from './controllers/index.js';
import { WorkspaceResolver, CollectionResolver } from './resolvers/index.js';
import { WorkspaceGuard } from './guards/index.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Workspace.name, schema: WorkspaceSchema },
            { name: Collection.name, schema: CollectionSchema },
            { name: User.name, schema: UserSchema }
        ]),
        AuthModule
    ],
    controllers: [
        WorkspaceController,
        CollectionController,
        CollectionTemplateController
    ],
    providers: [
        WorkspaceService,
        CollectionService,
        WorkspaceResolver,
        CollectionResolver,
        WorkspaceGuard
    ],
    exports: [WorkspaceService, CollectionService, WorkspaceGuard]
})
export class WorkspaceModule {}
