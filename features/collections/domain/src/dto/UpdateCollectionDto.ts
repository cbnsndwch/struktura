import { UpdateCollectionData } from '@cbnsndwch/struktura-collections-contracts';
import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
    ValidateNested
} from 'class-validator';

import { FieldDefinitionDto } from './FieldDefinitionDto.js';
import { ViewDefinitionDto } from './ViewDefinitionDto.js';

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
