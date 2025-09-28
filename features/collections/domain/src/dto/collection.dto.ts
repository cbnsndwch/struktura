import {
    IsString,
    IsOptional,
    IsArray,
    IsEnum,
    IsBoolean,
    MinLength,
    MaxLength,
    ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import {
    InputType,
    Field,
    ObjectType,
    PickType,
    OmitType
} from '@nestjs/graphql';

import {
    CreateCollectionData,
    UpdateCollectionData,
    AddFieldData,
    UpdateFieldData,
    CollectionTemplate
} from '@cbnsndwch/struktura-collections-contracts';
import { FieldType } from '../entities/field-type.enum.js';
import { FieldValidationRule } from '../entities/field-validation-rule.entity.js';
import { FieldOptions } from '../entities/field-options.entity.js';

@InputType()
export class FieldOptionsDto {
    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    choices?: Array<{ label: string; value: string; color?: string }>;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    referencedCollection?: string;

    @Field({ nullable: true })
    @IsOptional()
    min?: number;

    @Field({ nullable: true })
    @IsOptional()
    max?: number;

    @Field({ nullable: true })
    @IsOptional()
    precision?: number;

    @Field({ nullable: true })
    @IsOptional()
    minLength?: number;

    @Field({ nullable: true })
    @IsOptional()
    maxLength?: number;

    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    allowedTypes?: string[];

    @Field({ nullable: true })
    @IsOptional()
    maxSize?: number;
}

@InputType()
export class FieldValidationRuleDto {
    @Field()
    @IsString()
    type!: 'required' | 'unique' | 'min' | 'max' | 'pattern' | 'custom';

    @Field({ nullable: true })
    @IsOptional()
    value?: string | number;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    message?: string;
}

@InputType()
export class FieldDefinitionDto {
    @Field()
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    name!: string;

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

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    defaultValue?: string;

    @Field(() => [FieldValidationRuleDto])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldValidationRuleDto)
    validations!: FieldValidationRuleDto[];

    @Field(() => FieldOptionsDto, { nullable: true })
    @IsOptional()
    @ValidateNested()
    @Type(() => FieldOptionsDto)
    options?: FieldOptionsDto;
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
export class CreateCollectionDto implements CreateCollectionData {
    @Field()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name!: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    slug?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @Field()
    @IsString()
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
}

@InputType()
export class UpdateCollectionDto implements UpdateCollectionData {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    slug?: string;

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
    @IsBoolean()
    isActive?: boolean;
}

export class AddFieldDto implements AddFieldData {
    @Field()
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    name!: string;

    @Field(() => FieldType)
    @IsEnum(FieldType)
    type!: FieldType;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsBoolean()
    required?: boolean;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    defaultValue?: string;

    @Field(() => FieldOptionsDto, { nullable: true })
    @IsOptional()
    @ValidateNested()
    @Type(() => FieldOptionsDto)
    options?: FieldOptionsDto;

    @Field(() => [FieldValidationRuleDto], { nullable: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldValidationRuleDto)
    validations?: FieldValidationRuleDto[];
}

export class UpdateFieldDto implements UpdateFieldData {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    name?: string;

    @Field(() => FieldType, { nullable: true })
    @IsOptional()
    @IsEnum(FieldType)
    type?: FieldType;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsBoolean()
    required?: boolean;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    defaultValue?: string;

    @Field(() => FieldOptionsDto, { nullable: true })
    @IsOptional()
    @ValidateNested()
    @Type(() => FieldOptionsDto)
    options?: FieldOptionsDto;

    @Field(() => [FieldValidationRuleDto], { nullable: true })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldValidationRuleDto)
    validations?: FieldValidationRuleDto[];
}

// Collection template response
@ObjectType()
export class CollectionTemplateDto implements CollectionTemplate {
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
