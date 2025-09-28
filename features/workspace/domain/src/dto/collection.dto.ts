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
    ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { InputType, Field, ObjectType } from '@nestjs/graphql';

import { FieldType } from '../entities/collections/field-type.enum.js';
import { FieldValidationRule } from '../entities/collections/field-validation-rule.entity.js';
import { FieldOptions } from '../entities/collections/field-options.entity.js';

// @InputType()
// export class FieldValidationRuleDto {
//     @Field(() => String)
//     @IsString()
//     type!: string;

//     @Field(() => String, { name: 'ruleData' })
//     @IsString()
//     ruleValue!: string;

//     @Field(() => String)
//     @IsString()
//     message!: string;
// }

@InputType()
export class FieldOptionsDto implements FieldOptions {
    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    choices?: string[];

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    referencedCollection?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    displayField?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    formula?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    rollupFunction?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'concat';

    @Field({ nullable: true })
    @IsOptional()
    @IsNumber()
    precision?: number;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    currencyCode?: string;

    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allowedFileTypes?: string[];

    @Field({ nullable: true })
    @IsOptional()
    @IsNumber()
    maxFileSize?: number;

    @Field({ nullable: true })
    @IsOptional()
    @IsBoolean()
    allowMultiple?: boolean;
}

@InputType()
export class FieldDefinitionDto {
    @Field()
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    name!: string;

    @Field()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    label!: string;

    @Field(() => FieldType)
    @IsEnum(FieldType)
    type!: FieldType;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @Field()
    @IsBoolean()
    required!: boolean;

    @Field()
    @IsBoolean()
    unique!: boolean;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    defaultValue?: string;

    // Validations field for service compatibility (not exposed to GraphQL)
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldValidationRule)
    validations?: FieldValidationRule[];

    @Field(() => FieldOptionsDto, { nullable: true })
    @IsOptional()
    @ValidateNested()
    @Type(() => FieldOptionsDto)
    options?: FieldOptionsDto;

    @Field()
    @IsNumber()
    order!: number;
}

@InputType()
export class ViewDefinitionDto {
    @Field()
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    name!: string;

    @Field()
    @IsString()
    type!: 'table' | 'grid' | 'list' | 'kanban' | 'calendar';

    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    visibleFields?: string[];

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    filters?: string;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    sorting?: string;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    grouping?: string;
}

@InputType()
export class CreateCollectionDto {
    @Field()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name!: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    @Matches(/^[a-z0-9-]+$/, {
        message:
            'Slug must contain only lowercase letters, numbers, and hyphens'
    })
    slug?: string;

    @IsString()
    @Field(() => String)
    workspaceId!: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    icon?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    color?: string;

    @Field(() => [FieldDefinitionDto], { nullable: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldDefinitionDto)
    fields?: FieldDefinitionDto[];

    @Field(() => [ViewDefinitionDto], { nullable: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ViewDefinitionDto)
    views?: ViewDefinitionDto[];

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    defaultView?: string;
}

@InputType()
export class UpdateCollectionDto {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    icon?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    color?: string;

    @Field(() => [FieldDefinitionDto], { nullable: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldDefinitionDto)
    fields?: FieldDefinitionDto[];

    @Field(() => [ViewDefinitionDto], { nullable: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ViewDefinitionDto)
    views?: ViewDefinitionDto[];

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    defaultView?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

// Field template for common schemas
export class FieldTemplateDto {
    @IsString()
    name!: string;

    @IsString()
    description!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldDefinitionDto)
    fields!: FieldDefinitionDto[];

    @IsOptional()
    @IsString()
    category?: string;
}

// Collection template response
@ObjectType()
export class CollectionTemplateDto {
    @Field()
    @IsString()
    id!: string;

    @Field()
    @IsString()
    name!: string;

    @Field()
    @IsString()
    description!: string;

    @Field(() => [FieldDefinitionDto])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldDefinitionDto)
    fields!: FieldDefinitionDto[];

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    category?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    icon?: string;
}
