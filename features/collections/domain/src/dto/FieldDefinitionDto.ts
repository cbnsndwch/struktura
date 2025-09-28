import { InputType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
    IsString,
    MinLength,
    MaxLength,
    IsEnum,
    IsOptional,
    IsBoolean,
    IsArray,
    ValidateNested
} from 'class-validator';

import { FieldType } from '../entities/field-type.enum.js';

import { FieldOptionsDto } from './FieldOptionsDto.js';
import { FieldValidationRuleDto } from './FieldValidationRuleDto.js';

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
