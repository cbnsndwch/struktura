import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType, ID } from '@nestjs/graphql';
import {
    IsString,
    IsOptional,
    IsArray,
    IsBoolean,
    MinLength,
    MaxLength,
    ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { Document, Types } from 'mongoose';

import { Collection as ICollection } from '@cbnsndwch/struktura-collections-contracts';

import {
    FieldDefinition,
    FieldDefinitionSchema
} from './field-definition.entity.js';
import {
    ViewDefinition,
    ViewDefinitionSchema
} from './view-definition.entity.js';

export type CollectionDocument = Collection &
    Document & {
        createdAt: Date;
        updatedAt: Date;
    };

@ObjectType('Collection')
@Schema({ collection: 'collections', timestamps: true })
export class Collection implements ICollection {
    @Field(() => ID)
    id!: string;

    @Prop({ type: String, required: true })
    @Field()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name!: string;

    @Prop({ type: String, required: true })
    @Field()
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    slug!: string;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
    @Field(() => String)
    workspaceId!: string;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    icon?: string;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    color?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldDefinition)
    @Field(() => [FieldDefinition])
    @Prop({ type: [FieldDefinitionSchema], default: [] })
    fields!: FieldDefinition[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ViewDefinition)
    @Field(() => [ViewDefinition])
    @Prop({ type: [ViewDefinitionSchema], default: [] })
    views!: ViewDefinition[];

    @Prop({ type: Boolean, default: true })
    @Field()
    @IsBoolean()
    isActive!: boolean;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    @Field(() => String)
    createdBy!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    @Field(() => String, { nullable: true })
    @IsOptional()
    modifiedBy?: Types.ObjectId;

    @Field()
    createdAt!: Date;

    @Field()
    updatedAt!: Date;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);

// Add indexes for performance
CollectionSchema.index({ workspaceId: 1, slug: 1 }, { unique: true });
CollectionSchema.index({ workspaceId: 1, name: 1 });
CollectionSchema.index({ createdAt: -1 });
CollectionSchema.index({ isActive: 1 });
