/**
 * Records API client for collection data CRUD operations
 */
import { apiClient, type ServerRequestOptions } from './client.js';
import type { CollectionRecord } from '@cbnsndwch/struktura-schema-contracts';

export interface RecordData {
    [key: string]: unknown;
}

export interface CreateRecordInput {
    data: RecordData;
}

export interface UpdateRecordInput {
    data: Partial<RecordData>;
}

export interface QueryRecordsOptions {
    filter?: Record<string, unknown>;
    sort?: Record<string, 1 | -1>;
    limit?: number;
    skip?: number;
    select?: string[];
}

export interface BulkUpdateInput {
    id: string;
    data: Partial<RecordData>;
}

/**
 * Records API client for managing collection records
 */
export class RecordsApi {
    /**
     * Get all records for a collection
     */
    async getRecords(
        collectionId: string,
        options?: QueryRecordsOptions,
        requestOptions?: ServerRequestOptions
    ): Promise<CollectionRecord[]> {
        const queryParams = new URLSearchParams();
        
        if (options?.filter) {
            queryParams.append('filter', JSON.stringify(options.filter));
        }
        if (options?.sort) {
            queryParams.append('sort', JSON.stringify(options.sort));
        }
        if (options?.limit) {
            queryParams.append('limit', options.limit.toString());
        }
        if (options?.skip) {
            queryParams.append('skip', options.skip.toString());
        }
        if (options?.select) {
            queryParams.append('select', options.select.join(','));
        }

        const query = queryParams.toString();
        const endpoint = `/collections/${collectionId}/records${query ? `?${query}` : ''}`;
        
        return apiClient.get<CollectionRecord[]>(endpoint, requestOptions);
    }

    /**
     * Get a single record by ID
     */
    async getRecord(
        collectionId: string,
        recordId: string,
        requestOptions?: ServerRequestOptions
    ): Promise<CollectionRecord> {
        return apiClient.get<CollectionRecord>(
            `/collections/${collectionId}/records/${recordId}`,
            requestOptions
        );
    }

    /**
     * Count records in a collection
     */
    async countRecords(
        collectionId: string,
        filter?: Record<string, unknown>,
        requestOptions?: ServerRequestOptions
    ): Promise<number> {
        const queryParams = filter 
            ? `?filter=${JSON.stringify(filter)}`
            : '';
        
        const result = await apiClient.get<{ count: number }>(
            `/collections/${collectionId}/records/count${queryParams}`,
            requestOptions
        );
        
        return result.count;
    }

    /**
     * Create a new record
     */
    async createRecord(
        collectionId: string,
        input: CreateRecordInput,
        requestOptions?: ServerRequestOptions
    ): Promise<CollectionRecord> {
        return apiClient.post<CollectionRecord>(
            `/collections/${collectionId}/records`,
            input,
            requestOptions
        );
    }

    /**
     * Update a record
     */
    async updateRecord(
        collectionId: string,
        recordId: string,
        input: UpdateRecordInput,
        requestOptions?: ServerRequestOptions
    ): Promise<CollectionRecord> {
        return apiClient.patch<CollectionRecord>(
            `/collections/${collectionId}/records/${recordId}`,
            input,
            requestOptions
        );
    }

    /**
     * Delete a record
     */
    async deleteRecord(
        collectionId: string,
        recordId: string,
        requestOptions?: ServerRequestOptions
    ): Promise<void> {
        return apiClient.delete<void>(
            `/collections/${collectionId}/records/${recordId}`,
            requestOptions
        );
    }

    /**
     * Bulk create records
     */
    async bulkCreateRecords(
        collectionId: string,
        records: CreateRecordInput[],
        requestOptions?: ServerRequestOptions
    ): Promise<CollectionRecord[]> {
        return apiClient.post<CollectionRecord[]>(
            `/collections/${collectionId}/records/bulk`,
            { records },
            requestOptions
        );
    }

    /**
     * Bulk update records
     */
    async bulkUpdateRecords(
        collectionId: string,
        updates: BulkUpdateInput[],
        requestOptions?: ServerRequestOptions
    ): Promise<CollectionRecord[]> {
        return apiClient.patch<CollectionRecord[]>(
            `/collections/${collectionId}/records/bulk`,
            { updates },
            requestOptions
        );
    }

    /**
     * Bulk delete records
     */
    async bulkDeleteRecords(
        collectionId: string,
        recordIds: string[],
        requestOptions?: ServerRequestOptions
    ): Promise<void> {
        return apiClient.post<void>(
            `/collections/${collectionId}/records/bulk-delete`,
            { ids: recordIds },
            requestOptions
        );
    }
}

// Default records API instance
export const recordsApi = new RecordsApi();
