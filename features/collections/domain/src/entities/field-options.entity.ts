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

    // Formula field options
    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    formula?: string;

    // Lookup field options
    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    lookupCollection?: string;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    lookupField?: string;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    displayField?: string;

    // Auto-increment field options
    @Prop({ type: Number })
    @Field({ nullable: true })
    @IsOptional()
    @IsNumber()
    startValue?: number;

    @Prop({ type: Number })
    @Field({ nullable: true })
    @IsOptional()
    @IsNumber()
    increment?: number;

    // Display format for date/time fields
    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    displayFormat?: string;

    // Rollup field options
    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    rollupCollection?: string;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    rollupField?: string;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    aggregateFunction?: string;

    // Additional validation options
    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    placeholder?: string;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    helpText?: string;
}

export const FieldOptionsSchema = SchemaFactory.createForClass(FieldOptions);
