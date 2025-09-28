import { Injectable, Logger } from '@nestjs/common';
import { FieldType } from '@cbnsndwch/struktura-schema-contracts';

/**
 * Service for handling auto-generated field values
 */
@Injectable()
export class AutoFieldService {
    private readonly logger = new Logger(AutoFieldService.name);

    /**
     * Generate values for auto-generated fields during record creation
     */
    async generateAutoFields(
        fields: Array<{ name: string; type: FieldType; options?: any }>,
        userId: string,
        existingData: Record<string, unknown> = {}
    ): Promise<Record<string, unknown>> {
        const autoValues: Record<string, unknown> = {};

        for (const field of fields) {
            try {
                const value = await this.generateFieldValue(field.type, field.options, userId, existingData);
                if (value !== undefined) {
                    autoValues[field.name] = value;
                }
            } catch (error) {
                this.logger.error(`Failed to generate auto value for field ${field.name}`, error);
            }
        }

        return autoValues;
    }

    /**
     * Update auto-generated fields during record modification
     */
    async updateAutoFields(
        fields: Array<{ name: string; type: FieldType; options?: any }>,
        userId: string,
        existingData: Record<string, unknown> = {}
    ): Promise<Record<string, unknown>> {
        const autoValues: Record<string, unknown> = {};

        for (const field of fields) {
            // Only update certain auto fields on modification
            if (this.shouldUpdateOnModification(field.type)) {
                try {
                    const value = await this.generateFieldValue(field.type, field.options, userId, existingData);
                    if (value !== undefined) {
                        autoValues[field.name] = value;
                    }
                } catch (error) {
                    this.logger.error(`Failed to update auto value for field ${field.name}`, error);
                }
            }
        }

        return autoValues;
    }

    /**
     * Generate a value for a specific auto field type
     */
    private async generateFieldValue(
        fieldType: FieldType,
        options: any = {},
        userId: string,
        existingData: Record<string, unknown>
    ): Promise<unknown> {
        switch (fieldType) {
            case FieldType.CREATED_TIME:
                return new Date();

            case FieldType.MODIFIED_TIME:
                return new Date();

            case FieldType.CREATED_BY:
                return userId;

            case FieldType.MODIFIED_BY:
                return userId;

            case FieldType.AUTO_INCREMENT:
                return await this.generateAutoIncrementValue(options, existingData);

            default:
                return undefined;
        }
    }

    /**
     * Check if a field type should be updated on record modification
     */
    private shouldUpdateOnModification(fieldType: FieldType): boolean {
        return fieldType === FieldType.MODIFIED_TIME || fieldType === FieldType.MODIFIED_BY;
    }

    /**
     * Generate auto-increment value
     */
    private async generateAutoIncrementValue(
        options: any = {},
        existingData: Record<string, unknown>
    ): Promise<number> {
        // In a real implementation, this would:
        // 1. Query the database for the highest existing value
        // 2. Add the increment amount (default 1)
        // 3. Handle concurrent updates safely
        
        const startValue = options.startValue || 1;
        const increment = options.increment || 1;
        
        // Placeholder implementation - would need database integration
        // For now, return a mock incremented value
        return startValue;
    }

    /**
     * Validate auto field configuration
     */
    validateAutoFieldConfiguration(
        fieldType: FieldType,
        options: any = {}
    ): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        switch (fieldType) {
            case FieldType.AUTO_INCREMENT:
                if (options.startValue !== undefined && (!Number.isInteger(options.startValue) || options.startValue < 0)) {
                    errors.push('Start value must be a non-negative integer');
                }
                if (options.increment !== undefined && (!Number.isInteger(options.increment) || options.increment <= 0)) {
                    errors.push('Increment must be a positive integer');
                }
                break;

            case FieldType.CREATED_TIME:
            case FieldType.MODIFIED_TIME:
                if (options.displayFormat && !this.isValidDateFormat(options.displayFormat)) {
                    errors.push('Invalid date format specified');
                }
                break;

            case FieldType.CREATED_BY:
            case FieldType.MODIFIED_BY:
                // These fields don't need configuration validation
                break;

            default:
                errors.push(`${fieldType} is not an auto-generated field type`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Get default options for auto field types
     */
    getDefaultAutoFieldOptions(fieldType: FieldType): any {
        switch (fieldType) {
            case FieldType.AUTO_INCREMENT:
                return {
                    startValue: 1,
                    increment: 1
                };

            case FieldType.CREATED_TIME:
            case FieldType.MODIFIED_TIME:
                return {
                    displayFormat: 'YYYY-MM-DD HH:mm'
                };

            case FieldType.CREATED_BY:
            case FieldType.MODIFIED_BY:
                return {};

            default:
                return {};
        }
    }

    /**
     * Check if a field type is auto-generated
     */
    isAutoGeneratedField(fieldType: FieldType): boolean {
        return [
            FieldType.CREATED_TIME,
            FieldType.MODIFIED_TIME,
            FieldType.CREATED_BY,
            FieldType.MODIFIED_BY,
            FieldType.AUTO_INCREMENT
        ].includes(fieldType);
    }

    /**
     * Get all auto-generated field types
     */
    getAutoGeneratedFieldTypes(): FieldType[] {
        return [
            FieldType.CREATED_TIME,
            FieldType.MODIFIED_TIME,
            FieldType.CREATED_BY,
            FieldType.MODIFIED_BY,
            FieldType.AUTO_INCREMENT
        ];
    }

    private isValidDateFormat(format: string): boolean {
        const validFormats = [
            'YYYY-MM-DD',
            'MM/DD/YYYY',
            'DD/MM/YYYY',
            'YYYY-MM-DD HH:mm',
            'YYYY-MM-DD HH:mm:ss'
        ];
        return validFormats.includes(format);
    }

    /**
     * Process auto fields for bulk operations
     */
    async processBulkAutoFields(
        fields: Array<{ name: string; type: FieldType; options?: any }>,
        records: Array<Record<string, unknown>>,
        userId: string,
        isUpdate: boolean = false
    ): Promise<Array<Record<string, unknown>>> {
        const processedRecords: Array<Record<string, unknown>> = [];

        for (const record of records) {
            const autoValues = isUpdate 
                ? await this.updateAutoFields(fields, userId, record)
                : await this.generateAutoFields(fields, userId, record);

            processedRecords.push({
                ...record,
                ...autoValues
            });
        }

        return processedRecords;
    }

    getAutoFieldMetadata(fieldType: FieldType): {
        displayName: string;
        description: string;
        editable: boolean;
        category: string;
    } | null {
        const metadata: Partial<Record<FieldType, {
            displayName: string;
            description: string;
            editable: boolean;
            category: string;
        }>> = {
            [FieldType.CREATED_TIME]: {
                displayName: 'Created Time',
                description: 'Automatically set when a record is created',
                editable: false,
                category: 'timestamp'
            },
            [FieldType.MODIFIED_TIME]: {
                displayName: 'Modified Time',
                description: 'Automatically updated when a record is modified',
                editable: false,
                category: 'timestamp'
            },
            [FieldType.CREATED_BY]: {
                displayName: 'Created By',
                description: 'User who created the record',
                editable: false,
                category: 'user'
            },
            [FieldType.MODIFIED_BY]: {
                displayName: 'Modified By',
                description: 'User who last modified the record',
                editable: false,
                category: 'user'
            },
            [FieldType.AUTO_INCREMENT]: {
                displayName: 'Auto Number',
                description: 'Automatically incrementing number field',
                editable: false,
                category: 'sequence'
            }
        };

        return metadata[fieldType] || null;
    }
}