import { AddFieldData } from '@cbnsndwch/struktura-collections-contracts';
import { InputType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
    IsString,
    MinLength,
    MaxLength,
    IsEnum,
    IsOptional,
    IsBoolean,
    ValidateNested,
    IsArray
} from 'class-validator';

import { FieldType } from '../entities/index.js';

import { FieldOptionsDto } from './FieldOptionsDto.js';
import { FieldValidationRuleDto } from './FieldValidationRuleDto.js';

@InputType()
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
