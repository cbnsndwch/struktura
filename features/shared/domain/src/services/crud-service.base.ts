import { ServiceBase } from './service.base.js';

/**
 * Base repository pattern
 */
export abstract class CrudServiceBase<T> extends ServiceBase {
    protected abstract collectionName: string;

    async findById(id: string): Promise<T | null> {
        // Placeholder implementation
        console.log(`Finding ${this.collectionName} by id: ${id}`);
        return null;
    }

    async findAll(): Promise<T[]> {
        // Placeholder implementation
        console.log(`Finding all ${this.collectionName}`);
        return [];
    }

    async create(entity: Omit<T, 'id'>): Promise<T> {
        // Placeholder implementation
        console.log(`Creating ${this.collectionName}:`, entity);
        return entity as T;
    }

    async update(id: string, entity: Partial<T>): Promise<T | null> {
        // Placeholder implementation
        console.log(`Updating ${this.collectionName} ${id}:`, entity);
        return null;
    }

    async delete(id: string): Promise<boolean> {
        // Placeholder implementation
        console.log(`Deleting ${this.collectionName} ${id}`);
        return true;
    }
}
