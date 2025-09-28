import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

@InputType()
export class FieldValidationRuleDto {
    @Field()
    @IsString()
    type!: 'required' | 'unique' | 'min' | 'max' | 'pattern' | 'custom';

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    value?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    message?: string;
}
