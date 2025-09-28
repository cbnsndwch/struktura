import { Injectable } from '@nestjs/common';
import { StringUtils } from '@cbnsndwch/struktura-utils';

const GREETING = 'Welcome to Struktura - No-Code Data Management Platform!';

@Injectable()
export class AppService {
    getHello(): string {
        const id = StringUtils.generateId('app');

        return `${GREETING} (Generated ID: ${id})`;
    }
}
