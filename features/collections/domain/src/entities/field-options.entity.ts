import { ObjectType, Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional, IsArray, IsString, IsNumber } from 'class-validator';

import { FieldOptions as IFieldOptions } from '@cbnsndwch/struktura-collections-contracts';

// Field choice type for select/multiselect fields
@ObjectType()
export class FieldChoice {
    @Field()
    label!: string;

    @Field()
    value!: string;

    @Field({ nullable: true })
    color?: string;
}

// Field options for different field types

@ObjectType()
@Schema({ _id: false })
export class FieldOptions implements IFieldOptions {
    // For select/multiselect fields
    @Prop({ type: [{ label: String, value: String, color: String }] })
    @Field(() => [FieldChoice], { nullable: true })
    @IsOptional()
    @IsArray()
    choices?: Array<{ label: string; value: string; color?: string }>;

    // For reference fields
    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    referencedCollection?: string;

    // For number fields
    @Prop({ type: Number })
    @Field({ nullable: true })
    @IsOptional()
    @IsNumber()
    min?: number;

    @Prop({ type: Number })
    @Field({ nullable: true })
    @IsOptional()
    @IsNumber()
    max?: number;

    @Prop({ type: Number })
    @Field({ nullable: true })
    @IsOptional()
    @IsNumber()
    precision?: number;

    // For text fields
    @Prop({ type: Number })
    @Field({ nullable: true })
    @IsOptional()
    @IsNumber()
    minLength?: number;

    @Prop({ type: Number })
    @Field({ nullable: true })
    @IsOptional()
    @IsNumber()
    maxLength?: number;

    // File/attachment options
    @Prop({ type: [String] })
    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allowedTypes?: string[];

    @Prop({ type: Number })
    @Field({ nullable: true })
    @IsOptional()
    @IsNumber()
    maxSize?: number;
}

export const FieldOptionsSchema = SchemaFactory.createForClass(FieldOptions);
