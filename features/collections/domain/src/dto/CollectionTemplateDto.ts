import { CollectionTemplate } from '@cbnsndwch/struktura-collections-contracts';
import { Field, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

import { FieldDefinition } from '../entities/field-definition.entity.js';

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

    @Field(() => [FieldDefinition])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldDefinition)
    fields!: FieldDefinition[];

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    category?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    icon?: string;
}
