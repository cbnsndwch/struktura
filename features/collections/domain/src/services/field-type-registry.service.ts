import { Injectable, Logger } from '@nestjs/common';

import { FieldType } from '@cbnsndwch/struktura-schema-contracts';

// Type definitions for field values and options
type FieldValue =
    | string
    | number
    | boolean
    | Date
    | null
    | Array<string | number>;

type FieldOptionsMap = Record<string, unknown>;

// Validation result interface
interface FieldValidationResult {
    isValid: boolean;
    error?: string;
}

export interface FieldTypeCapabilities {
    /** Whether this field type supports validation rules */
    supportsValidation: boolean;
    /** Whether this field type supports default values */
    supportsDefaultValue: boolean;
    /** Whether this field type is computed (auto-generated) */
    isComputed: boolean;
    /** Whether this field type supports indexing */
    supportsIndexing: boolean;
    /** Whether this field type requires special processing */
    requiresProcessing: boolean;
    /** Available options for this field type */
    availableOptions: string[];
    /** Description of the field type */
    description: string;
    /** Category for grouping field types */
    category: 'basic' | 'advanced' | 'relationship' | 'computed' | 'file';
}

export interface FieldTypeHandler {
    /** Process field value before saving */
    processValue?(value: FieldValue, options?: FieldOptionsMap): FieldValue;
    /** Validate field value */
    validateValue?(
        value: FieldValue,
        options?: FieldOptionsMap
    ): FieldValidationResult;
    /** Generate default value */
    generateDefaultValue?(options?: FieldOptionsMap): FieldValue;
    /** Format field value for display */
    formatValue?(value: FieldValue, options?: FieldOptionsMap): string;
}

/**
 * Registry service for managing field types and their capabilities
 */
@Injectable()
export class FieldTypeService {
    private readonly logger = new Logger(FieldTypeService.name);
    private readonly registry = new Map<FieldType, FieldTypeCapabilities>();
    private readonly handlers = new Map<FieldType, FieldTypeHandler>();

    constructor() {
        this.initializeRegistry();
    }

    /**
     * Safely convert unknown value to FieldValue type
     */
    private toFieldValue(value: unknown): FieldValue {
        if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean' ||
            value instanceof Date ||
            value === null
        ) {
            return value;
        }
        if (Array.isArray(value)) {
            // Filter array to only include valid field value types
            return value.filter(
                (item): item is string | number =>
                    typeof item === 'string' || typeof item === 'number'
            );
        }
        // Convert other types to string representation or null
        if (value === undefined) {
            return null;
        }
        return String(value);
    }

    /**
     * Get capabilities for a specific field type
     */
    getFieldTypeCapabilities(
        fieldType: FieldType
    ): FieldTypeCapabilities | null {
        return this.registry.get(fieldType) || null;
    }

    /**
     * Get all registered field types
     */
    getAllFieldTypes(): Array<{
        type: FieldType;
        capabilities: FieldTypeCapabilities;
    }> {
        return Array.from(this.registry.entries()).map(
            ([type, capabilities]) => ({
                type,
                capabilities
            })
        );
    }

    /**
     * Get field types by category
     */
    getFieldTypesByCategory(
        category: FieldTypeCapabilities['category']
    ): FieldType[] {
        return Array.from(this.registry.entries())
            .filter(([, capabilities]) => capabilities.category === category)
            .map(([type]) => type);
    }

    /**
     * Check if a field type supports a specific capability
     */
    supportsCapability(
        fieldType: FieldType,
        capability: keyof FieldTypeCapabilities
    ): boolean {
        const capabilities = this.registry.get(fieldType);
        if (!capabilities) return false;

        return Boolean(capabilities[capability]);
    }

    /**
     * Process a field value using its handler
     */
    async processFieldValue(
        fieldType: FieldType,
        value: unknown,
        options?: FieldOptionsMap
    ): Promise<FieldValue> {
        const fieldValue = this.toFieldValue(value);
        const handler = this.handlers.get(fieldType);
        if (handler?.processValue) {
            try {
                return await handler.processValue(fieldValue, options);
            } catch (error) {
                this.logger.error(
                    `Error processing value for field type ${fieldType}`,
                    error
                );
                return fieldValue;
            }
        }
        return fieldValue;
    }

    /**
     * Validate a field value using its handler
     */
    validateFieldValue(
        fieldType: FieldType,
        value: unknown,
        options?: FieldOptionsMap
    ): FieldValidationResult {
        const fieldValue = this.toFieldValue(value);
        const handler = this.handlers.get(fieldType);
        if (handler?.validateValue) {
            try {
                return handler.validateValue(fieldValue, options);
            } catch (error) {
                this.logger.error(
                    `Error validating value for field type ${fieldType}`,
                    error
                );
                return { isValid: false, error: 'Validation error' };
            }
        }
        return { isValid: true };
    }

    /**
     * Generate default value for a field type
     */
    generateDefaultValue(
        fieldType: FieldType,
        options?: FieldOptionsMap
    ): FieldValue {
        const handler = this.handlers.get(fieldType);
        if (handler?.generateDefaultValue) {
            try {
                return handler.generateDefaultValue(options);
            } catch (error) {
                this.logger.error(
                    `Error generating default value for field type ${fieldType}`,
                    error
                );
                return null;
            }
        }
        return null;
    }

    /**
     * Format field value for display
     */
    formatFieldValue(
        fieldType: FieldType,
        value: unknown,
        options?: FieldOptionsMap
    ): string {
        const fieldValue = this.toFieldValue(value);
        const handler = this.handlers.get(fieldType);
        if (handler?.formatValue) {
            try {
                return handler.formatValue(fieldValue, options);
            } catch (error) {
                this.logger.error(
                    `Error formatting value for field type ${fieldType}`,
                    error
                );
                return String(fieldValue || '');
            }
        }
        return String(fieldValue || '');
    }

    private initializeRegistry(): void {
        // Basic types
        this.registry.set(FieldType.TEXT, {
            supportsValidation: true,
            supportsDefaultValue: true,
            isComputed: false,
            supportsIndexing: true,
            requiresProcessing: false,
            availableOptions: ['minLength', 'maxLength', 'placeholder'],
            description: 'Single-line text input',
            category: 'basic'
        });

        this.registry.set(FieldType.NUMBER, {
            supportsValidation: true,
            supportsDefaultValue: true,
            isComputed: false,
            supportsIndexing: true,
            requiresProcessing: false,
            availableOptions: ['min', 'max', 'precision'],
            description: 'Numeric input with validation',
            category: 'basic'
        });

        this.registry.set(FieldType.BOOLEAN, {
            supportsValidation: false,
            supportsDefaultValue: true,
            isComputed: false,
            supportsIndexing: true,
            requiresProcessing: false,
            availableOptions: [],
            description: 'True/false checkbox',
            category: 'basic'
        });

        this.registry.set(FieldType.DATE, {
            supportsValidation: true,
            supportsDefaultValue: true,
            isComputed: false,
            supportsIndexing: true,
            requiresProcessing: false,
            availableOptions: ['min', 'max', 'displayFormat'],
            description: 'Date picker input',
            category: 'basic'
        });

        this.registry.set(FieldType.DATETIME, {
            supportsValidation: true,
            supportsDefaultValue: true,
            isComputed: false,
            supportsIndexing: true,
            requiresProcessing: false,
            availableOptions: ['min', 'max', 'displayFormat'],
            description: 'Date and time picker',
            category: 'basic'
        });

        // Rich types
        this.registry.set(FieldType.EMAIL, {
            supportsValidation: true,
            supportsDefaultValue: true,
            isComputed: false,
            supportsIndexing: true,
            requiresProcessing: false,
            availableOptions: ['placeholder'],
            description: 'Email address with validation',
            category: 'basic'
        });

        this.registry.set(FieldType.URL, {
            supportsValidation: true,
            supportsDefaultValue: true,
            isComputed: false,
            supportsIndexing: true,
            requiresProcessing: false,
            availableOptions: ['placeholder'],
            description: 'URL with validation',
            category: 'basic'
        });

        this.registry.set(FieldType.PHONE, {
            supportsValidation: true,
            supportsDefaultValue: true,
            isComputed: false,
            supportsIndexing: true,
            requiresProcessing: false,
            availableOptions: ['placeholder'],
            description: 'Phone number with formatting',
            category: 'basic'
        });

        this.registry.set(FieldType.CURRENCY, {
            supportsValidation: true,
            supportsDefaultValue: true,
            isComputed: false,
            supportsIndexing: true,
            requiresProcessing: false,
            availableOptions: ['min', 'max', 'precision', 'currency'],
            description: 'Currency amount with formatting',
            category: 'basic'
        });

        this.registry.set(FieldType.PERCENT, {
            supportsValidation: true,
            supportsDefaultValue: true,
            isComputed: false,
            supportsIndexing: true,
            requiresProcessing: false,
            availableOptions: ['min', 'max', 'precision'],
            description: 'Percentage value',
            category: 'basic'
        });

        // Selection types
        this.registry.set(FieldType.SELECT, {
            supportsValidation: true,
            supportsDefaultValue: true,
            isComputed: false,
            supportsIndexing: true,
            requiresProcessing: false,
            availableOptions: ['choices'],
            description: 'Single selection from predefined options',
            category: 'basic'
        });

        this.registry.set(FieldType.MULTISELECT, {
            supportsValidation: true,
            supportsDefaultValue: true,
            isComputed: false,
            supportsIndexing: false,
            requiresProcessing: false,
            availableOptions: ['choices'],
            description: 'Multiple selections from predefined options',
            category: 'basic'
        });

        // File types
        this.registry.set(FieldType.ATTACHMENT, {
            supportsValidation: true,
            supportsDefaultValue: false,
            isComputed: false,
            supportsIndexing: false,
            requiresProcessing: true,
            availableOptions: ['allowedTypes', 'maxSize'],
            description: 'File upload with type and size validation',
            category: 'file'
        });

        this.registry.set(FieldType.IMAGE, {
            supportsValidation: true,
            supportsDefaultValue: false,
            isComputed: false,
            supportsIndexing: false,
            requiresProcessing: true,
            availableOptions: [
                'allowedTypes',
                'maxSize',
                'maxWidth',
                'maxHeight'
            ],
            description: 'Image upload with preview',
            category: 'file'
        });

        // Relationship types
        this.registry.set(FieldType.REFERENCE, {
            supportsValidation: true,
            supportsDefaultValue: false,
            isComputed: false,
            supportsIndexing: true,
            requiresProcessing: false,
            availableOptions: ['referencedCollection'],
            description: 'Reference to a record in another collection',
            category: 'relationship'
        });

        this.registry.set(FieldType.LOOKUP, {
            supportsValidation: false,
            supportsDefaultValue: false,
            isComputed: true,
            supportsIndexing: false,
            requiresProcessing: true,
            availableOptions: [
                'lookupCollection',
                'lookupField',
                'displayField'
            ],
            description: 'Display value from a referenced record',
            category: 'relationship'
        });

        this.registry.set(FieldType.ROLLUP, {
            supportsValidation: false,
            supportsDefaultValue: false,
            isComputed: true,
            supportsIndexing: false,
            requiresProcessing: true,
            availableOptions: [
                'rollupCollection',
                'rollupField',
                'aggregateFunction'
            ],
            description: 'Aggregate values from related records',
            category: 'relationship'
        });

        // Advanced types
        this.registry.set(FieldType.JSON, {
            supportsValidation: true,
            supportsDefaultValue: true,
            isComputed: false,
            supportsIndexing: false,
            requiresProcessing: false,
            availableOptions: ['schema'],
            description: 'Structured JSON data',
            category: 'advanced'
        });

        this.registry.set(FieldType.ARRAY, {
            supportsValidation: true,
            supportsDefaultValue: true,
            isComputed: false,
            supportsIndexing: false,
            requiresProcessing: false,
            availableOptions: ['itemType', 'minItems', 'maxItems'],
            description: 'Array of values',
            category: 'advanced'
        });

        this.registry.set(FieldType.OBJECT, {
            supportsValidation: true,
            supportsDefaultValue: true,
            isComputed: false,
            supportsIndexing: false,
            requiresProcessing: false,
            availableOptions: ['properties'],
            description: 'Structured object with properties',
            category: 'advanced'
        });

        // Computed types
        this.registry.set(FieldType.FORMULA, {
            supportsValidation: false,
            supportsDefaultValue: false,
            isComputed: true,
            supportsIndexing: false,
            requiresProcessing: true,
            availableOptions: ['formula'],
            description: 'Calculated value based on formula',
            category: 'computed'
        });

        this.registry.set(FieldType.AUTO_INCREMENT, {
            supportsValidation: false,
            supportsDefaultValue: false,
            isComputed: true,
            supportsIndexing: true,
            requiresProcessing: true,
            availableOptions: ['startValue', 'increment'],
            description: 'Auto-incrementing number',
            category: 'computed'
        });

        this.registry.set(FieldType.CREATED_TIME, {
            supportsValidation: false,
            supportsDefaultValue: false,
            isComputed: true,
            supportsIndexing: true,
            requiresProcessing: true,
            availableOptions: ['displayFormat'],
            description: 'Record creation timestamp',
            category: 'computed'
        });

        this.registry.set(FieldType.MODIFIED_TIME, {
            supportsValidation: false,
            supportsDefaultValue: false,
            isComputed: true,
            supportsIndexing: true,
            requiresProcessing: true,
            availableOptions: ['displayFormat'],
            description: 'Record modification timestamp',
            category: 'computed'
        });

        this.registry.set(FieldType.CREATED_BY, {
            supportsValidation: false,
            supportsDefaultValue: false,
            isComputed: true,
            supportsIndexing: true,
            requiresProcessing: true,
            availableOptions: [],
            description: 'User who created the record',
            category: 'computed'
        });

        this.registry.set(FieldType.MODIFIED_BY, {
            supportsValidation: false,
            supportsDefaultValue: false,
            isComputed: true,
            supportsIndexing: true,
            requiresProcessing: true,
            availableOptions: [],
            description: 'User who last modified the record',
            category: 'computed'
        });

        // Initialize handlers for computed types
        this.initializeHandlers();
    }

    private initializeHandlers(): void {
        // Handler for CREATED_TIME
        this.handlers.set(FieldType.CREATED_TIME, {
            generateDefaultValue: (): Date => new Date(),
            formatValue: (
                value: FieldValue,
                options?: FieldOptionsMap
            ): string => {
                if (value instanceof Date) {
                    return options?.displayFormat
                        ? this.formatDate(
                              value,
                              options.displayFormat as string
                          )
                        : value.toISOString();
                }
                return String(value || '');
            }
        });

        // Handler for MODIFIED_TIME
        this.handlers.set(FieldType.MODIFIED_TIME, {
            processValue: (): Date => new Date(),
            formatValue: (
                value: FieldValue,
                options?: FieldOptionsMap
            ): string => {
                if (value instanceof Date) {
                    return options?.displayFormat
                        ? this.formatDate(
                              value,
                              options.displayFormat as string
                          )
                        : value.toISOString();
                }
                return String(value || '');
            }
        });

        // Handler for AUTO_INCREMENT
        this.handlers.set(FieldType.AUTO_INCREMENT, {
            generateDefaultValue: (options?: FieldOptionsMap): number => {
                // This would need to query the database for the next value
                // For now, return a placeholder
                return (options?.startValue as number) || 1;
            }
        });

        // Handler for CURRENCY
        this.handlers.set(FieldType.CURRENCY, {
            validateValue: (
                value: FieldValue,
                options?: FieldOptionsMap
            ): FieldValidationResult => {
                const numValue = Number(value);
                if (isNaN(numValue)) {
                    return { isValid: false, error: 'Invalid currency value' };
                }
                if (
                    options?.min !== undefined &&
                    numValue < (options.min as number)
                ) {
                    return {
                        isValid: false,
                        error: `Value must be at least ${options.min}`
                    };
                }
                if (
                    options?.max !== undefined &&
                    numValue > (options.max as number)
                ) {
                    return {
                        isValid: false,
                        error: `Value must be at most ${options.max}`
                    };
                }
                return { isValid: true };
            },
            formatValue: (
                value: FieldValue,
                options?: FieldOptionsMap
            ): string => {
                const numValue = Number(value);
                if (isNaN(numValue)) return '0';

                const currency = (options?.currency as string) || 'USD';
                const precision = (options?.precision as number) || 2;

                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency,
                    maximumFractionDigits: precision
                }).format(numValue);
            }
        });
    }

    private formatDate(date: Date, format: string): string {
        // Simple date formatting - could be enhanced with a proper date library
        const formats: Record<string, string> = {
            'YYYY-MM-DD': date.toISOString().split('T')[0] || '',
            'MM/DD/YYYY': date.toLocaleDateString('en-US'),
            'DD/MM/YYYY': date.toLocaleDateString('en-GB'),
            'YYYY-MM-DD HH:mm': date
                .toISOString()
                .slice(0, 16)
                .replace('T', ' ')
        };

        return formats[format] || date.toISOString();
    }
}
