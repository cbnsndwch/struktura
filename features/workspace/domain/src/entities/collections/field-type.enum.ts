// Field types supported by the schema builder

export enum FieldType {
    // Basic Types
    TEXT = 'text',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    DATE = 'date',
    DATETIME = 'datetime',

    // Rich Types
    EMAIL = 'email',
    URL = 'url',
    PHONE = 'phone',
    CURRENCY = 'currency',
    PERCENT = 'percent',

    // Selection Types
    SELECT = 'select',
    MULTISELECT = 'multiselect',

    // File Types
    ATTACHMENT = 'attachment',
    IMAGE = 'image',

    // Relationship Types
    REFERENCE = 'reference',
    LOOKUP = 'lookup',
    ROLLUP = 'rollup',

    // Advanced Types
    JSON = 'json',
    ARRAY = 'array',
    OBJECT = 'object',

    // Computed Types
    FORMULA = 'formula',
    AUTO_INCREMENT = 'autoIncrement',
    CREATED_TIME = 'createdTime',
    MODIFIED_TIME = 'modifiedTime',
    CREATED_BY = 'createdBy',
    MODIFIED_BY = 'modifiedBy'
}

export const FIELD_TYPES = Object.values(FieldType);
