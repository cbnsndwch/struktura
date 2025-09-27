import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from '../auth/schemas/user.schema.js';

import { WorkspaceService } from './services/workspace.service.js';
import { WorkspaceController } from './controllers/workspace.controller.js';
import { WorkspaceResolver } from './graphql/workspace.resolver.js';
import { Workspace, WorkspaceSchema } from './schemas/workspace.schema.js';

// Collection-related imports
import { CollectionService } from './services/collection.service.js';
import {
    CollectionController,
    CollectionTemplateController
} from './controllers/collection.controller.js';
import { CollectionResolver } from './graphql/collection.resolver.js';
import { Collection, CollectionSchema } from './schemas/collection.schema.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Workspace.name, schema: WorkspaceSchema },
            { name: User.name, schema: UserSchema },
            { name: Collection.name, schema: CollectionSchema }
        ])
    ],
    controllers: [
        WorkspaceController,
        CollectionController,
        CollectionTemplateController
    ],
    providers: [
        WorkspaceService,
        WorkspaceResolver,
        CollectionService,
        CollectionResolver
    ],
    exports: [WorkspaceService, CollectionService]
})
export class WorkspaceModule {}
