import { Module } from '@nestjs/common';

import { MonitoringController } from './monitoring.controller.js';
import { MonitoringResolver } from './monitoring.resolver.js';

@Module({
    controllers: [MonitoringController],
    providers: [MonitoringResolver]
})
export class MonitoringModule {}
