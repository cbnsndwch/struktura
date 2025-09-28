import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsArray, IsString } from 'class-validator';

@InputType()
export class FieldChoiceInputDto {
    @Field()
    label!: string;

    @Field()
    value!: string;

    @Field({ nullable: true })
    color?: string;
}

@InputType()
export class FieldOptionsDto {
    @Field(() => [FieldChoiceInputDto], { nullable: true })
    @IsOptional()
    @IsArray()
    choices?: Array<{ label: string; value: string; color?: string }>;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    referencedCollection?: string;

    @Field({ nullable: true })
    @IsOptional()
    min?: number;

    @Field({ nullable: true })
    @IsOptional()
    max?: number;

    @Field({ nullable: true })
    @IsOptional()
    precision?: number;

    @Field({ nullable: true })
    @IsOptional()
    minLength?: number;

    @Field({ nullable: true })
    @IsOptional()
    maxLength?: number;

    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    allowedTypes?: string[];

    @Field({ nullable: true })
    @IsOptional()
    maxSize?: number;
}
