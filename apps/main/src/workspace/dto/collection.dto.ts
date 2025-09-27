import {
    IsString,
    IsOptional,
    IsArray,
    IsEnum,
    IsBoolean,
    IsNumber,
    MinLength,
    MaxLength,
    Matches,
    ValidateNested,
    IsObject
} from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType, ValidationRule, FieldOptions } from '../schemas/collection.schema.js';

export class ValidationRuleDto implements ValidationRule {
    @IsEnum(['required', 'minLength', 'maxLength', 'pattern', 'min', 'max', 'email', 'url', 'custom'])
    type!: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max' | 'email' | 'url' | 'custom';

    @IsOptional()
    value?: any;

    @IsString()
    message!: string;
}

export class FieldOptionsDto implements FieldOptions {
    @IsOptional()
    @IsArray()
    options?: Array<{
        value: string;
        label: string;
        color?: string;
    }>;

    @IsOptional()
    @IsNumber()
    precision?: number;

    @IsOptional()
    @IsString()
    linkedCollection?: string;

    @IsOptional()
    @IsString()
    linkedField?: string;

    @IsOptional()
    @IsString()
    formula?: string;

    @IsOptional()
    @IsArray()
    allowedFileTypes?: string[];

    @IsOptional()
    @IsNumber()
    maxFileSize?: number;

    @IsOptional()
    @IsEnum(Object.values(FieldType))
    itemType?: FieldType;

    @IsOptional()
    @IsString()
    displayFormat?: string;

    @IsOptional()
    @IsString()
    helpText?: string;

    @IsOptional()
    @IsString()
    placeholder?: string;
}

export class FieldDto {
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    id!: string;

    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name!: string;

    @IsEnum(FieldType)
    type!: FieldType;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsOptional()
    @IsBoolean()
    required?: boolean;

    @IsOptional()
    @IsBoolean()
    unique?: boolean;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ValidationRuleDto)
    validation?: ValidationRuleDto[];

    @IsOptional()
    @ValidateNested()
    @Type(() => FieldOptionsDto)
    options?: FieldOptionsDto;

    @IsNumber()
    order!: number;
}

export class CreateCollectionDto {
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    @Matches(/^[a-z0-9-]+$/, {
        message: 'Slug must contain only lowercase letters, numbers, and hyphens'
    })
    slug?: string;

    @IsString()
    workspace!: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldDto)
    fields?: FieldDto[];

    @IsOptional()
    @IsEnum(['draft', 'active', 'archived'])
    status?: 'draft' | 'active' | 'archived';

    @IsOptional()
    @IsObject()
    settings?: {
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

export class UpdateCollectionDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldDto)
    fields?: FieldDto[];

    @IsOptional()
    @IsEnum(['draft', 'active', 'archived'])
    status?: 'draft' | 'active' | 'archived';

    @IsOptional()
    @IsObject()
    settings?: {
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

// Field template for common schemas
export class FieldTemplateDto {
    @IsString()
    name!: string;

    @IsString()
    description!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldDto)
    fields!: FieldDto[];

    @IsOptional()
    @IsString()
    category?: string;
}

// Collection template response
export class CollectionTemplateDto {
    @IsString()
    id!: string;

    @IsString()
    name!: string;

    @IsString()
    description!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldDto)
    fields!: FieldDto[];

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    icon?: string;
}