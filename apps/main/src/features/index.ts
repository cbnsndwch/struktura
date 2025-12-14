import { AuthModule } from '@cbnsndwch/struktura-auth-domain/module';
import { CollectionsModule } from '@cbnsndwch/struktura-collections-domain/module';
import { WorkspaceModule } from '@cbnsndwch/struktura-workspace-domain/module';

import { apolloModule } from './apollo.module.js';
import { DbModule } from './db.module.js';
import { MonitoringModule } from './monitoring/monitoring.module.js';

export const features = [
    apolloModule,
    DbModule,
    AuthModule,
    WorkspaceModule,
    CollectionsModule,
    MonitoringModule

    // add feature modules here
];
