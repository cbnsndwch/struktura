// Field types supported by the schema builder
import { FieldType as IFieldType } from '@cbnsndwch/struktura-collections-contracts';

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
    FORMULA = 'formula',
    BARCODE = 'barcode',
    QR_CODE = 'qr_code',
    RATING = 'rating',
    PROGRESS = 'progress',
    JSON = 'json'
}

export const FIELD_TYPES = Object.values(FieldType);
