import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import {
    IsString,
    MinLength,
    MaxLength,
    IsEnum,
    IsOptional,
    IsBoolean,
    IsArray,
    ValidateNested
} from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';

import { FieldDefinition as IFieldDefinition } from '@cbnsndwch/struktura-collections-contracts';

import { FIELD_TYPES, FieldType } from './field-type.enum.js';
import {
    FieldValidationRule,
    FieldValidationRuleSchema
} from './field-validation-rule.entity.js';
import { FieldOptions, FieldOptionsSchema } from './field-options.entity.js';

// Register enums for GraphQL
registerEnumType(FieldType, {
    name: 'FieldType',
    description: 'The types available for collection fields'
});

@Schema({ _id: false })
@ObjectType()
export class FieldDefinition implements IFieldDefinition {
    @Prop({ type: String, required: true })
    @Field()
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    name!: string;

    @Prop({ type: String, enum: FIELD_TYPES, required: true })
    @Field(() => FieldType)
    @IsEnum(FieldType)
    type!: FieldType;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @Prop({ type: Boolean, default: false })
    @Field()
    @IsBoolean()
    required!: boolean;

    @IsOptional()
    @IsString()
    @Prop({ type: MongooseSchema.Types.Mixed })
    @Field(() => String, { nullable: true })
    defaultValue?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldValidationRule)
    @Field(() => [FieldValidationRule])
    @Prop({ type: [FieldValidationRuleSchema], default: [] })
    validations!: FieldValidationRule[];

    @IsOptional()
    @ValidateNested()
    @Type(() => FieldOptions)
    @Field(() => FieldOptions, { nullable: true })
    @Prop({ type: FieldOptionsSchema })
    options?: FieldOptions;
}

export const FieldDefinitionSchema =
    SchemaFactory.createForClass(FieldDefinition);
