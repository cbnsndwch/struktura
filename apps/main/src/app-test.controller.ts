import { Controller, Get } from '@nestjs/common';

import { Public } from '@cbnsndwch/struktura-auth-domain';

@Controller()
export class AppTestController {
    @Public()
    @Get()
    getHello(): string {
        return 'Welcome to Struktura - No-Code Data Management Platform! (Generated ID: test-123)';
    }

    @Public()
    @Get('health')
    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'struktura-main',
            version: '0.1.0',
            database: {
                status: 'mocked',
                readyState: 1
            }
        };
    }
}
