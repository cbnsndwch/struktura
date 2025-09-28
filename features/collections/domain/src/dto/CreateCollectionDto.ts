import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
    ValidateNested
} from 'class-validator';

import { CreateCollectionData } from '@cbnsndwch/struktura-collections-contracts';

import { FieldDefinitionDto } from './FieldDefinitionDto.js';

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
