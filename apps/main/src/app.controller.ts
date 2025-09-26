import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { AppService } from './app.service.js';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        @InjectConnection() private readonly connection: mongoose.Connection
    ) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Get('health')
    getHealth() {
        let dbStatus = 'unknown';
        let readyState = 0;
        
        try {
            readyState = this.connection.readyState;
            dbStatus = readyState === 1 ? 'connected' : 'disconnected';
        } catch (error) {
            dbStatus = 'error';
        }
        
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'struktura-main',
            version: '0.1.0',
            database: {
                status: dbStatus,
                readyState
            }
        };
    }
}
