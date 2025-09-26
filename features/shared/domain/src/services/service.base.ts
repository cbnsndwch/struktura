import { Logger } from '@nestjs/common';

// Base service class that all feature services can extend

export abstract class ServiceBase {
    protected abstract name: string;

    protected logger: Logger;

    constructor(logger: Logger = new Logger('ServiceBase')) {
        this.logger = logger;
    }
}
