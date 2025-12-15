import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Workspace, WorkspaceSchema } from './entities/index.js';
import { WorkspaceService } from './services/index.js';
import { WorkspaceController } from './controllers/index.js';
import { WorkspaceResolver } from './resolvers/index.js';
import { WorkspaceGuard } from './guards/index.js';

/**
 * WorkspaceModule - Multi-tenant workspace management
 *
 * This module provides workspace CRUD operations and membership management.
 * It depends on AuthModule being imported globally (via forRoot) to access
 * UserService for user lookups by email.
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Workspace.name, schema: WorkspaceSchema }
        ])
    ],
    controllers: [WorkspaceController],
    providers: [WorkspaceService, WorkspaceResolver, WorkspaceGuard],
    exports: [WorkspaceService, WorkspaceGuard]
})
export class WorkspaceModule {}
