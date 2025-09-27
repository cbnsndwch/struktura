import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType, ID, registerEnumType } from '@nestjs/graphql';
import {
    IsString,
    IsOptional,
    IsEnum,
    IsArray,
    IsBoolean,
    IsNumber,
    MinLength,
    MaxLength,
    ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type CollectionDocument = Collection &
    Document & {
        createdAt: Date;
        updatedAt: Date;
    };

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

// Register enums for GraphQL
registerEnumType(FieldType, {
    name: 'FieldType',
    description: 'The types available for collection fields'
});

// Validation rule interface
@ObjectType()
export class ValidationRule {
    @Prop({ type: String, required: true })
    @Field()
    @IsString()
    type!:
        | 'required'
        | 'minLength'
        | 'maxLength'
        | 'pattern'
        | 'min'
        | 'max'
        | 'email'
        | 'url'
        | 'phone'
        | 'unique'
        | 'custom';

    @Prop({ type: MongooseSchema.Types.Mixed })
    @Field({ nullable: true })
    @IsOptional()
    value?: unknown;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    message?: string;
}

// Field options for different field types
@ObjectType()
export class FieldOptions {
    // For select/multiselect fields
    @Prop({ type: [String] })
    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    choices?: string[];

    // For reference fields
    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    referencedCollection?: string;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    displayField?: string;

    // For formula fields
    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    formula?: string;

    // For rollup fields
    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    rollupFunction?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'concat';

    // For number/currency fields
    @Prop({ type: Number })
    @Field({ nullable: true })
    @IsOptional()
    @IsNumber()
    precision?: number;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    currencyCode?: string;

    // File upload options
    @Prop({ type: [String] })
    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allowedFileTypes?: string[];

    @Prop({ type: Number })
    @Field({ nullable: true })
    @IsOptional()
    @IsNumber()
    maxFileSize?: number; // in bytes

    @Prop({ type: Boolean })
    @Field({ nullable: true })
    @IsOptional()
    @IsBoolean()
    allowMultiple?: boolean;
}

// Field definition for dynamic schema
@ObjectType()
export class FieldDefinition {
    @Prop({ type: String, required: true })
    @Field()
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    name!: string;

    @Prop({ type: String, required: true })
    @Field()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    label!: string;

    @Prop({ type: String, enum: Object.values(FieldType), required: true })
    @Field(() => FieldType)
    @IsEnum(FieldType)
    type!: FieldType;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @Prop({ type: Boolean, default: false })
    @Field()
    @IsBoolean()
    required!: boolean;

    @Prop({ type: Boolean, default: false })
    @Field()
    @IsBoolean()
    unique!: boolean;

    @Prop({ type: MongooseSchema.Types.Mixed })
    @Field({ nullable: true })
    @IsOptional()
    defaultValue?: unknown;

    @Prop({ type: [ValidationRule] })
    @Field(() => [ValidationRule], { nullable: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ValidationRule)
    validations?: ValidationRule[];

    @Prop({ type: FieldOptions })
    @Field(() => FieldOptions, { nullable: true })
    @IsOptional()
    @ValidateNested()
    @Type(() => FieldOptions)
    options?: FieldOptions;

    @Prop({ type: Number, default: 0 })
    @Field()
    @IsNumber()
    order!: number;
}

// View definition for different ways to display collection data
@ObjectType()
export class ViewDefinition {
    @Prop({ type: String, required: true })
    @Field()
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    name!: string;

    @Prop({
        type: String,
        enum: ['table', 'grid', 'list', 'kanban', 'calendar'],
        default: 'table'
    })
    @Field()
    @IsString()
    type!: 'table' | 'grid' | 'list' | 'kanban' | 'calendar';

    @Prop({ type: [String] })
    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    visibleFields?: string[];

    @Prop({ type: MongooseSchema.Types.Mixed })
    @Field({ nullable: true })
    @IsOptional()
    filters?: Record<string, unknown>;

    @Prop({ type: MongooseSchema.Types.Mixed })
    @Field({ nullable: true })
    @IsOptional()
    sorting?: Record<string, 'asc' | 'desc'>;

    @Prop({ type: MongooseSchema.Types.Mixed })
    @Field({ nullable: true })
    @IsOptional()
    grouping?: Record<string, unknown>;
}

@Schema({
    timestamps: true,
    collection: 'collections'
})
@ObjectType('Collection')
export class Collection {
    @Field(() => ID)
    id!: string;

    @Prop({ type: String, required: true })
    @Field()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name!: string;

    @Prop({ type: String, required: true })
    @Field()
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    slug!: string;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
    @Field()
    workspaceId!: Types.ObjectId;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    icon?: string;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    color?: string;

    @Prop({ type: [FieldDefinition], default: [] })
    @Field(() => [FieldDefinition])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldDefinition)
    fields!: FieldDefinition[];

    @Prop({ type: [ViewDefinition], default: [] })
    @Field(() => [ViewDefinition])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ViewDefinition)
    views!: ViewDefinition[];

    @Prop({ type: String, default: 'table' })
    @Field()
    @IsString()
    defaultView!: string;

    @Prop({ type: Boolean, default: true })
    @Field()
    @IsBoolean()
    isActive!: boolean;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    @Field()
    createdBy!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    @Field({ nullable: true })
    @IsOptional()
    modifiedBy?: Types.ObjectId;

    @Field()
    createdAt!: Date;

    @Field()
    updatedAt!: Date;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);

// Add indexes for performance
CollectionSchema.index({ workspaceId: 1, slug: 1 }, { unique: true });
CollectionSchema.index({ workspaceId: 1, name: 1 });
CollectionSchema.index({ createdAt: -1 });
CollectionSchema.index({ isActive: 1 });