import { ObjectType, Field } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { IsBoolean } from 'class-validator';

@ObjectType()
export class WorkspaceFeatures {
    @Prop({ type: Boolean, default: false })
    @Field()
    @IsBoolean()
    apiAccess!: boolean;

    @Prop({ type: Boolean, default: true })
    @Field()
    @IsBoolean()
    realTimeSync!: boolean;

    @Prop({ type: Boolean, default: false })
    @Field()
    @IsBoolean()
    advancedPermissions!: boolean;
}
