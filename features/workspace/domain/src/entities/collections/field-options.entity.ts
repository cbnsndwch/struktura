import { ObjectType, Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
    IsOptional,
    IsArray,
    IsString,
    IsNumber,
    IsBoolean
} from 'class-validator';

// Field options for different field types

@ObjectType()
@Schema({ _id: false })
export class FieldOptions {
    // For select/multiselect fields
    @Prop({ type: [String] })
    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    choices?: string[];

    // For reference fields
    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    referencedCollection?: string;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    displayField?: string;

    // For formula fields
    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    formula?: string;

    // For rollup fields
    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    rollupFunction?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'concat';

    // For number/currency fields
    @Prop({ type: Number })
    @Field({ nullable: true })
    @IsOptional()
    @IsNumber()
    precision?: number;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    currencyCode?: string;

    // File upload options
    @Prop({ type: [String] })
    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allowedFileTypes?: string[];

    @Prop({ type: Number })
    @Field({ nullable: true })
    @IsOptional()
    @IsNumber()
    maxFileSize?: number; // in bytes

    // in bytes
    @Prop({ type: Boolean })
    @Field({ nullable: true })
    @IsOptional()
    @IsBoolean()
    allowMultiple?: boolean;
}

export const FieldOptionsSchema = SchemaFactory.createForClass(FieldOptions);
