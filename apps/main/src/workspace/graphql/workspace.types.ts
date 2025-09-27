import { ObjectType, Field, ID, InputType, registerEnumType } from '@nestjs/graphql';
import { WorkspaceRole } from '../dto/index.js';

// Register the enum for GraphQL
registerEnumType(WorkspaceRole, {
    name: 'WorkspaceRole',
    description: 'The roles available in a workspace'
});

@ObjectType()
export class WorkspaceSettings {
    @Field()
    timezone!: string;

    @Field()
    dateFormat!: string;

    @Field()
    numberFormat!: string;
}

@ObjectType()
export class WorkspaceMember {
    @Field(() => ID)
    user!: string;

    @Field(() => WorkspaceRole)
    role!: WorkspaceRole;

    @Field()
    invitedAt!: Date;

    @Field({ nullable: true })
    joinedAt?: Date;
}

@ObjectType()
export class Workspace {
    @Field(() => ID)
    id!: string;

    @Field()
    name!: string;

    @Field()
    slug!: string;

    @Field({ nullable: true })
    description?: string;

    @Field(() => ID)
    owner!: string;

    @Field(() => [WorkspaceMember])
    members!: WorkspaceMember[];

    @Field(() => WorkspaceSettings)
    settings!: WorkspaceSettings;

    @Field()
    createdAt!: Date;

    @Field()
    updatedAt!: Date;
}

@InputType()
export class CreateWorkspaceInput {
    @Field()
    name!: string;

    @Field({ nullable: true })
    description?: string;

    @Field({ nullable: true })
    slug?: string;
}

@InputType()
export class UpdateWorkspaceInput {
    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    description?: string;
}

@InputType()
export class UpdateWorkspaceSettingsInput {
    @Field({ nullable: true })
    timezone?: string;

    @Field({ nullable: true })
    dateFormat?: string;

    @Field({ nullable: true })
    numberFormat?: string;
}

@InputType()
export class InviteMemberInput {
    @Field()
    email!: string;

    @Field(() => WorkspaceRole)
    role!: WorkspaceRole;

    @Field({ nullable: true })
    inviteMessage?: string;
}

@InputType()
export class UpdateMemberRoleInput {
    @Field(() => WorkspaceRole)
    role!: WorkspaceRole;
}