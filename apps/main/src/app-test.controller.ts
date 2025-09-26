import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppTestController {
    @Get()
    getHello(): string {
        return 'Welcome to Struktura - No-Code Data Management Platform! (Generated ID: test-123)';
    }

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
