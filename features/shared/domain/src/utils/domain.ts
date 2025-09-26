import type {
    IPaginationParams,
    IPaginatedResult,
    Result
} from '@cbnsndwch/struktura-shared-contracts';

/**
 * Utility functions for shared domain logic.
 */
export class DomainUtils {
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
