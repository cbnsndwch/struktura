import type { Dict } from '@cbnsndwch/struktura-shared-contracts';

/**
 * Represents a domain event that occurs within the system.
 *
 * Domain events are used to capture and communicate significant business occurrences
 * that have happened in the domain model. They contain information about what happened,
 * when it occurred, and any relevant data associated with the event.
 *
 * @template T - The type of the event payload data. Defaults to Dict if not specified.
 *
 * @example
 * ```typescript
 * interface UserCreatedPayload {
 *   userId: string;
 *   email: string;
 * }
 *
 * const userCreatedEvent: DomainEvent<UserCreatedPayload> = {
 *   type: 'user.created',
 *   ts: new Date(),
 *   payload: {
 *     userId: '123',
 *     email: 'user@example.com'
 *   }
 * };
 * ```
 */
export interface IDomainEvent<T = Dict> {
    /**
     * The type of the event.
     */
    type: string;

    /**
     * The timestamp when the event occurred.
     */
    ts: Date;

    /**
     * The payload data associated with the event.
     */
    payload: T;
}
