import type { IDomainEvent } from './domain-event.contract.js';

// TODO: replace this with NestJS EventEmitter

export class EventBus {
    private listeners: Map<string, Array<(event: IDomainEvent) => void>> =
        new Map();

    subscribe(eventType: string, handler: (event: IDomainEvent) => void): void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType)!.push(handler);
    }

    publish(event: IDomainEvent): void {
        const handlers = this.listeners.get(event.type) || [];
        handlers.forEach(handler => handler(event));
    }
}

// Singleton event bus instance
export const globalEventBus = new EventBus();
