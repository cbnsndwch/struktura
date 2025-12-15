import { ObjectType, Field } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import {
    IsString,
    IsObject,
    ValidateNested,
    IsOptional
} from 'class-validator';

import type { IWorkspaceSettings } from '@cbnsndwch/struktura-workspace-contracts';

import { WorkspaceBranding } from './workspace-branding.entity.js';
import { WorkspaceFeatures } from './workspace-features.entity.js';

@ObjectType('WorkspaceSettings')
export class WorkspaceSettings implements IWorkspaceSettings {
    @Prop({ type: String, default: 'UTC' })
    @Field()
    @IsString()
    defaultTimezone!: string;

    @Prop({ type: String, default: 'en' })
    @Field()
    @IsString()
    defaultLanguage!: string;

    @Prop({
        type: {
            apiAccess: { type: Boolean, default: false },
            realTimeSync: { type: Boolean, default: true },
            advancedPermissions: { type: Boolean, default: false }
        },
        default: {}
    })
    @Field(() => WorkspaceFeatures)
    @IsObject()
    @ValidateNested()
    @Type(() => WorkspaceFeatures)
    features!: WorkspaceFeatures;

    @Prop({
        type: {
            logo: { type: String },
            primaryColor: { type: String },
            customDomain: { type: String }
        }
    })
    @Field(() => WorkspaceBranding, { nullable: true })
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => WorkspaceBranding)
    branding?: WorkspaceBranding;
}
