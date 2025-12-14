import { ObjectType, Field } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { IsOptional, IsString } from 'class-validator';

@ObjectType()
export class WorkspaceBranding {
    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    logo?: string;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    primaryColor?: string;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    customDomain?: string;
}
