import { Injectable } from '@nestjs/common';
import { StringUtils } from '@cbnsndwch/struktura-utils';

@Injectable()
export class AppService {
    getHello(): string {
        const greeting =
            'Welcome to Struktura - No-Code Data Management Platform!';
        const id = StringUtils.generateId('app');

        return `${greeting} (Generated ID: ${id})`;
    }
}
