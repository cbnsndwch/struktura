import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@ObjectType()
@Schema({ _id: false })
export class FieldValidationRule {
    @Prop({ type: String, required: true })
    @IsString()
    type!: string;

    @Prop({ type: String, default: '' })
    @IsString()
    ruleValue!: string;

    @Prop({ type: String, default: '' })
    @IsString()
    message!: string;
}

export const FieldValidationRuleSchema =
    SchemaFactory.createForClass(FieldValidationRule);
