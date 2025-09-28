import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule, User, UserSchema } from '@cbnsndwch/struktura-auth-domain';

import { Workspace, WorkspaceSchema } from './entities/index.js';
import { WorkspaceService } from './services/index.js';
import { WorkspaceController } from './controllers/index.js';
import { WorkspaceResolver } from './resolvers/index.js';
import { WorkspaceGuard } from './guards/index.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Workspace.name, schema: WorkspaceSchema },
            { name: User.name, schema: UserSchema }
        ]),
        AuthModule
    ],
    controllers: [WorkspaceController],
    providers: [WorkspaceService, WorkspaceResolver, WorkspaceGuard],
    exports: [WorkspaceService, WorkspaceGuard]
})
export class WorkspaceModule {}
