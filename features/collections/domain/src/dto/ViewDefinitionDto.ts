import { InputType, Field } from '@nestjs/graphql';
import {
    IsString,
    MinLength,
    MaxLength,
    IsOptional,
    IsArray
} from 'class-validator';

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
