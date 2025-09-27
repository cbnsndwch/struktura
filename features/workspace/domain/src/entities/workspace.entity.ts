import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType, ID, registerEnumType } from '@nestjs/graphql';
import {
    IsString,
    IsOptional,
    IsEnum,
    MinLength,
    MaxLength,
    IsObject,
    ValidateNested,
    IsBoolean,
    IsDate
} from 'class-validator';
import { Type } from 'class-transformer';
import { Document, Types } from 'mongoose';
import type {
    Workspace as IWorkspace,
    WorkspaceSettings as IWorkspaceSettings
} from '@cbnsndwch/struktura-workspace-contracts';
import { WorkspaceRole } from '@cbnsndwch/struktura-workspace-contracts';

export type WorkspaceDocument = Workspace &
    Document & {
        createdAt: Date;
        updatedAt: Date;
    };

// Register the enum for GraphQL
registerEnumType(WorkspaceRole, {
    name: 'WorkspaceRole',
    description: 'The roles available in a workspace'
});

@ObjectType()
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

@ObjectType()
export class WorkspaceMember {
    @Field(() => ID)
    user!: string;

    @Field(() => WorkspaceRole)
    @IsEnum(WorkspaceRole)
    role!: WorkspaceRole;

    @Field()
    @IsDate()
    invitedAt!: Date;

    @Field({ nullable: true })
    @IsOptional()
    @IsDate()
    joinedAt?: Date;
}

/**
 * Consolidated Workspace class that serves as:
 * - Mongoose Schema (with @Prop decorators)
 * - GraphQL ObjectType (with @Field decorators)
 * - DTO with validation (with class-validator decorators)
 * - Domain Entity (implements IWorkspace interface)
 */
@Schema({
    timestamps: true,
    collection: 'workspaces'
})
@ObjectType('Workspace', { description: 'Workspace information' })
export class Workspace implements IWorkspace {
    // Public fields - exposed in GraphQL and API responses
    @Field(() => ID)
    id!: string;

    @Prop({ type: String, required: true })
    @Field()
    @IsString()
    @MinLength(2, {
        message: 'Workspace name must be at least 2 characters long'
    })
    @MaxLength(100, { message: 'Workspace name cannot exceed 100 characters' })
    name!: string;

    @Prop({ type: String, required: true, unique: true })
    @Field()
    @IsString()
    @MinLength(3, {
        message: 'Workspace slug must be at least 3 characters long'
    })
    @MaxLength(50, { message: 'Workspace slug cannot exceed 50 characters' })
    slug!: string;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
    description?: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    @Field(() => ID)
    owner!: Types.ObjectId;

    // For interface compatibility
    get ownerId(): string {
        return this.owner.toString();
    }

    @Prop({
        type: [
            {
                user: { type: Types.ObjectId, ref: 'User', required: true },
                role: {
                    type: String,
                    enum: ['owner', 'admin', 'editor', 'viewer'],
                    required: true
                },
                invitedAt: { type: Date, required: true },
                joinedAt: { type: Date }
            }
        ],
        default: []
    })
    @Field(() => [WorkspaceMember])
    members!: Array<{
        user: Types.ObjectId;
        role: 'owner' | 'admin' | 'editor' | 'viewer';
        invitedAt: Date;
        joinedAt?: Date;
    }>;

    @Prop({
        type: {
            defaultTimezone: { type: String, default: 'UTC' },
            defaultLanguage: { type: String, default: 'en' },
            features: {
                type: {
                    apiAccess: { type: Boolean, default: false },
                    realTimeSync: { type: Boolean, default: true },
                    advancedPermissions: { type: Boolean, default: false }
                },
                default: {}
            },
            branding: {
                type: {
                    logo: { type: String },
                    primaryColor: { type: String },
                    customDomain: { type: String }
                }
            }
        },
        default: {}
    })
    @Field(() => WorkspaceSettings)
    @IsObject()
    @ValidateNested()
    @Type(() => WorkspaceSettings)
    settings!: WorkspaceSettings;

    @Field()
    createdAt!: Date;

    @Field()
    updatedAt!: Date;

    // Domain methods
    static fromData(data: IWorkspace): Workspace {
        const workspace = new Workspace();
        workspace.id = data.id;
        workspace.name = data.name;
        workspace.slug = data.slug;
        workspace.description = data.description;
        workspace.owner = new Types.ObjectId(data.ownerId);
        workspace.settings = data.settings as WorkspaceSettings;
        workspace.createdAt = data.createdAt;
        workspace.updatedAt = data.updatedAt;
        return workspace;
    }

    toData(): IWorkspace {
        return {
            id: this.id,
            name: this.name,
            slug: this.slug,
            description: this.description,
            ownerId: this.owner.toString(),
            settings: this.settings,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Check if a user is a member of this workspace
     */
    isMember(userId: string): boolean {
        return this.members.some(member => member.user.toString() === userId);
    }

    /**
     * Get a member's role in this workspace
     */
    getMemberRole(userId: string): WorkspaceRole | null {
        const member = this.members.find(
            member => member.user.toString() === userId
        );
        return member ? (member.role as WorkspaceRole) : null;
    }

    /**
     * Check if a user has a specific role or higher
     */
    hasRoleOrHigher(userId: string, requiredRole: WorkspaceRole): boolean {
        const userRole = this.getMemberRole(userId);
        if (!userRole) return false;

        const roleHierarchy = [
            WorkspaceRole.VIEWER,
            WorkspaceRole.EDITOR,
            WorkspaceRole.ADMIN,
            WorkspaceRole.OWNER
        ];

        const userRoleIndex = roleHierarchy.indexOf(userRole);
        const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

        return userRoleIndex >= requiredRoleIndex;
    }
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);

// Add indexes for performance
WorkspaceSchema.index({ slug: 1 }, { unique: true });
WorkspaceSchema.index({ owner: 1 });
WorkspaceSchema.index({ 'members.user': 1 });
WorkspaceSchema.index({ createdAt: -1 });
