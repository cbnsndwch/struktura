import type { IUser } from '../models/index.js';

export interface IUserService {
    findById(id: string): Promise<IUser | null>;
    findByEmail(email: string): Promise<IUser | null>;
    create(data: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<IUser>;
    update(id: string, data: Partial<IUser>): Promise<IUser>;
    delete(id: string): Promise<void>;
}
