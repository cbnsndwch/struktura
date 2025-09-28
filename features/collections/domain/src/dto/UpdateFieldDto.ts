import { InputType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
    IsOptional,
    IsString,
    MinLength,
    MaxLength,
    IsEnum,
    IsBoolean,
    ValidateNested,
    IsArray
} from 'class-validator';

import { FieldType } from '@cbnsndwch/struktura-schema-contracts';
import { UpdateFieldData } from '@cbnsndwch/struktura-collections-contracts';

import { FieldOptionsDto } from './FieldOptionsDto.js';
import { FieldValidationRuleDto } from './FieldValidationRuleDto.js';

@InputType()
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
