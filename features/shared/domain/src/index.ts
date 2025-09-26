import { Logger } from '@nestjs/common';

import type {
    IPaginationParams,
    IPaginatedResult,
    Result
} from '@cbnsndwch/struktura-shared-contracts';

// Base service class that all feature services can extend
export abstract class BaseService {
    protected abstract name: string;

    protected logger: Logger;

    /**
     *
     */
    constructor(logger: Logger = new Logger('BaseService')) {
        this.logger = logger;
    }
}

// Utility functions for common operations
export class SharedUtils {
    static createSuccessResult<T>(data: T): Result<T> {
        return {
            success: true,
            data
        };
    }

    static createErrorResult<T>(error: string): Result<T> {
        return {
            success: false,
            error
        };
    }

    static createPaginatedResult<T>(
        items: T[],
        total: number,
        params: IPaginationParams
    ): IPaginatedResult<T> {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const totalPages = Math.ceil(total / limit);

        return {
            items,
            total,
            page,
            limit,
            totalPages
        };
    }

    static generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Event system for cross-feature communication
export interface DomainEvent {
    type: string;
    payload: any;
    timestamp: Date;
}

export class EventBus {
    private listeners: Map<string, Array<(event: DomainEvent) => void>> =
        new Map();

    subscribe(eventType: string, handler: (event: DomainEvent) => void): void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType)!.push(handler);
    }

    publish(event: DomainEvent): void {
        const handlers = this.listeners.get(event.type) || [];
        handlers.forEach(handler => handler(event));
    }
}

// Singleton event bus instance
export const globalEventBus = new EventBus();
