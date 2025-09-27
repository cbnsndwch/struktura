import { Injectable } from '@nestjs/common';
import { StringUtils } from '@cbnsndwch/struktura-utils';

const GREETING = 'Wilkommen in Struktura - No-Code Data Management Platform!';

@Injectable()
export class AppService {
    getHello(): string {
        const id = StringUtils.generateId('app');

        return `${GREETING} (Generated ID: ${id})`;
    }
}
