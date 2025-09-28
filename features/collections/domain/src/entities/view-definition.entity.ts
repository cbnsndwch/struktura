import { ObjectType, Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
    IsString,
    MinLength,
    MaxLength,
    IsOptional,
    IsArray
} from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';

import { ViewDefinition as IViewDefinition } from '@cbnsndwch/struktura-collections-contracts';

// View definition for different ways to display collection data

@ObjectType()
@Schema({ _id: false })
export class ViewDefinition implements IViewDefinition {
    @Prop({ type: String, required: true })
    @Field()
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    name!: string;

    @Prop({
        type: String,
        enum: ['table', 'grid', 'list', 'kanban', 'calendar'],
        default: 'table'
    })
    @Field()
    @IsString()
    type!: 'table' | 'grid' | 'list' | 'kanban' | 'calendar';

    @Prop({ type: [String] })
    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    visibleFields?: string[];

    @Prop({ type: MongooseSchema.Types.Mixed })
    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    filters?: string;

    @Prop({ type: MongooseSchema.Types.Mixed })
    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    sorting?: string;

    @Prop({ type: MongooseSchema.Types.Mixed })
    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    grouping?: string;
}

export const ViewDefinitionSchema =
    SchemaFactory.createForClass(ViewDefinition);
