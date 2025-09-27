import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from '../auth/schemas/user.schema.js';

import { WorkspaceService } from './services/workspace.service.js';
import { WorkspaceController } from './controllers/workspace.controller.js';
import { WorkspaceResolver } from './graphql/workspace.resolver.js';
import { Workspace, WorkspaceSchema } from './schemas/workspace.schema.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Workspace.name, schema: WorkspaceSchema },
            { name: User.name, schema: UserSchema }
        ])
    ],
    controllers: [WorkspaceController],
    providers: [WorkspaceService, WorkspaceResolver],
    exports: [WorkspaceService]
})
export class WorkspaceModule {}
