import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Collection, CollectionDocument } from '../entities/collection.entity.js';

/**
 * Service for resolving lookup fields that reference data from other collections
 */
@Injectable()
export class LookupService {
    private readonly logger = new Logger(LookupService.name);

    constructor(
        @InjectModel(Collection.name)
        private readonly collectionModel: Model<CollectionDocument>
    ) {}

    /**
     * Resolve lookup field values for a record
     */
    async resolveLookupFields(
        collectionId: string,
        recordData: Record<string, unknown>,
        lookupFields: Array<{
            name: string;
            lookupCollection: string;
            lookupField: string;
            displayField: string;
        }>
    ): Promise<Record<string, unknown>> {
        const resolvedData = { ...recordData };

        for (const lookupField of lookupFields) {
            try {
                const lookupValue = await this.resolveLookupValue(
                    lookupField.lookupCollection,
                    lookupField.lookupField,
                    recordData[lookupField.name],
                    lookupField.displayField
                );
                
                resolvedData[`${lookupField.name}_resolved`] = lookupValue;
            } catch (error) {
                this.logger.error(
                    `Failed to resolve lookup for field ${lookupField.name}`,
                    error
                );
                resolvedData[`${lookupField.name}_resolved`] = null;
            }
        }

        return resolvedData;
    }

    /**
     * Resolve a single lookup value
     */
    async resolveLookupValue(
        targetCollectionId: string,
        lookupFieldName: string,
        lookupValue: unknown,
        displayFieldName: string
    ): Promise<unknown> {
        if (!lookupValue) {
            return null;
        }

        try {
            // This would typically query the records collection for the target collection
            // For now, we'll simulate the lookup resolution
            // In a real implementation, this would use a RecordService to query the target collection
            
            // Placeholder implementation - would need integration with record storage
            const lookupResult = await this.performLookupQuery(
                targetCollectionId,
                lookupFieldName,
                lookupValue,
                displayFieldName
            );

            return lookupResult;
        } catch (error) {
            this.logger.error(
                `Failed to resolve lookup value for collection ${targetCollectionId}`,
                error
            );
            return null;
        }
    }

    /**
     * Validate lookup field configuration
     */
    async validateLookupField(
        sourceCollectionId: string,
        targetCollectionId: string,
        lookupFieldName: string,
        displayFieldName: string
    ): Promise<{ isValid: boolean; errors: string[] }> {
        const errors: string[] = [];

        try {
            // Check if target collection exists
            const targetCollection = await this.collectionModel.findById(targetCollectionId).exec();
            if (!targetCollection) {
                errors.push(`Target collection ${targetCollectionId} does not exist`);
                return { isValid: false, errors };
            }

            // Check if lookup field exists in target collection
            const lookupFieldExists = targetCollection.fields?.some(
                field => field.name === lookupFieldName
            );
            if (!lookupFieldExists) {
                errors.push(`Lookup field '${lookupFieldName}' does not exist in target collection`);
            }

            // Check if display field exists in target collection
            const displayFieldExists = targetCollection.fields?.some(
                field => field.name === displayFieldName
            );
            if (!displayFieldExists) {
                errors.push(`Display field '${displayFieldName}' does not exist in target collection`);
            }

            // Prevent circular references
            if (sourceCollectionId === targetCollectionId) {
                errors.push('Circular reference: source and target collections cannot be the same');
            }

        } catch (error) {
            errors.push(`Error validating lookup field: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Get available fields for lookup from a target collection
     */
    async getAvailableLookupFields(collectionId: string): Promise<Array<{
        name: string;
        type: string;
        description?: string;
    }>> {
        try {
            const collection = await this.collectionModel.findById(collectionId).exec();
            if (!collection || !collection.fields) {
                return [];
            }

            return collection.fields.map(field => ({
                name: field.name,
                type: field.type,
                description: field.description
            }));
        } catch (error) {
            this.logger.error(
                `Failed to get available lookup fields for collection ${collectionId}`,
                error
            );
            return [];
        }
    }

    private async performLookupQuery(
        targetCollectionId: string,
        lookupFieldName: string,
        lookupValue: unknown,
        displayFieldName: string
    ): Promise<unknown> {
        // Placeholder for actual record query implementation
        // In a real implementation, this would:
        // 1. Query the records collection for the target collection
        // 2. Find records where lookupFieldName matches lookupValue
        // 3. Return the value of displayFieldName from the found record(s)
        
        // For now, return a mock result
        return `Lookup result for ${lookupValue} from ${targetCollectionId}`;
    }

    /**
     * Batch resolve lookup values for multiple records
     */
    async batchResolveLookupFields(
        collectionId: string,
        records: Array<Record<string, unknown>>,
        lookupFields: Array<{
            name: string;
            lookupCollection: string;
            lookupField: string;
            displayField: string;
        }>
    ): Promise<Array<Record<string, unknown>>> {
        const resolvedRecords: Array<Record<string, unknown>> = [];

        for (const record of records) {
            const resolved = await this.resolveLookupFields(
                collectionId,
                record,
                lookupFields
            );
            resolvedRecords.push(resolved);
        }

        return resolvedRecords;
    }

    /**
     * Refresh lookup values when referenced data changes
     */
    async refreshLookupValues(
        sourceCollectionId: string,
        targetCollectionId: string,
        changedRecordId: string
    ): Promise<void> {
        try {
            // This would typically:
            // 1. Find all collections that have lookup fields referencing the target collection
            // 2. Find all records in those collections that reference the changed record
            // 3. Refresh the lookup values for those records
            
            this.logger.debug(
                `Refreshing lookup values for changes in collection ${targetCollectionId}, record ${changedRecordId}`
            );
            
            // Placeholder for actual refresh implementation
        } catch (error) {
            this.logger.error(
                `Failed to refresh lookup values for collection ${targetCollectionId}`,
                error
            );
        }
    }
}