import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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

// Validation rule interface
export interface ValidationRule {
    type:
        | 'required'
        | 'minLength'
        | 'maxLength'
        | 'pattern'
        | 'min'
        | 'max'
        | 'email'
        | 'url'
        | 'custom';
    value?: any;
    message: string;
}

// Field options for different field types
export interface FieldOptions {
    // For SELECT and MULTISELECT
    options?: Array<{
        value: string;
        label: string;
        color?: string;
    }>;

    // For NUMBER, CURRENCY, PERCENT
    precision?: number;

    // For REFERENCE
    linkedCollection?: string;
    linkedField?: string;

    // For FORMULA
    formula?: string;

    // For ATTACHMENT and IMAGE
    allowedFileTypes?: string[];
    maxFileSize?: number;

    // For ARRAY
    itemType?: FieldType;

    // UI configuration
    displayFormat?: string;
    helpText?: string;
    placeholder?: string;
}

// Field definition schema
@Schema({ _id: false })
export class Field {
    @Prop({ type: String, required: true })
    id!: string;

    @Prop({ type: String, required: true })
    name!: string;

    @Prop({ type: String, enum: Object.values(FieldType), required: true })
    type!: FieldType;

    @Prop({ type: String })
    description?: string;

    @Prop({ type: Boolean, default: false })
    required!: boolean;

    @Prop({ type: Boolean, default: false })
    unique!: boolean;

    @Prop({ type: Array, default: [] })
    validation!: ValidationRule[];

    @Prop({ type: Object, default: {} })
    options!: FieldOptions;

    @Prop({ type: Number, required: true })
    order!: number;
}

export const FieldSchema = SchemaFactory.createForClass(Field);

// Collection document type
export type CollectionDocument = Collection &
    Document & {
        createdAt: Date;
        updatedAt: Date;
    };

// Collection schema definition
@Schema({
    timestamps: true,
    collection: 'collections'
})
export class Collection {
    @Prop({ type: String, required: true })
    name!: string;

    @Prop({ type: String, required: true })
    slug!: string;

    @Prop({ type: String })
    description?: string;

    @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
    workspace!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy!: Types.ObjectId;

    @Prop({ type: [FieldSchema], default: [] })
    fields!: Field[];

    @Prop({
        type: String,
        enum: ['draft', 'active', 'archived'],
        default: 'draft'
    })
    status!: 'draft' | 'active' | 'archived';

    @Prop({
        type: {
            primaryField: { type: String, required: false },
            defaultView: { type: String, required: false },
            permissions: {
                type: {
                    create: { type: Boolean, default: true },
                    read: { type: Boolean, default: true },
                    update: { type: Boolean, default: true },
                    delete: { type: Boolean, default: true }
                },
                required: false,
                default: {}
            }
        },
        default: {}
    })
    settings!: {
        primaryField?: string;
        defaultView?: string;
        permissions?: {
            create: boolean;
            read: boolean;
            update: boolean;
            delete: boolean;
        };
    };
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);

// Add indexes for performance
CollectionSchema.index({ workspace: 1, slug: 1 }, { unique: true });
CollectionSchema.index({ workspace: 1 });
CollectionSchema.index({ createdBy: 1 });
CollectionSchema.index({ status: 1 });
CollectionSchema.index({ createdAt: 1 });
