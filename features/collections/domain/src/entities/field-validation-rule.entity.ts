import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

import { FieldValidationRule as IFieldValidationRule } from '@cbnsndwch/struktura-collections-contracts';

@ObjectType()
@Schema({ _id: false })
export class FieldValidationRule implements IFieldValidationRule {
    @Prop({ type: String, required: true })
    @Field()
    @IsString()
    type!: 'required' | 'unique' | 'min' | 'max' | 'pattern' | 'custom';

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    value?: string | number;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    message?: string;
}

export const FieldValidationRuleSchema =
    SchemaFactory.createForClass(FieldValidationRule);
