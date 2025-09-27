import { IsString, IsEnum, IsEmail, IsOptional } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

import { WorkspaceRole } from '../entities/index.js';

export class InviteMemberDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email!: string;

    @IsEnum(WorkspaceRole, { message: 'Please provide a valid role' })
    role!: WorkspaceRole;

    @IsOptional()
    @IsString()
    inviteMessage?: string;
}

@InputType()
export class InviteMemberInput {
    @Field()
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email!: string;

    @Field(() => WorkspaceRole)
    @IsEnum(WorkspaceRole, { message: 'Please provide a valid role' })
    role!: WorkspaceRole;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    inviteMessage?: string;
}

export class UpdateMemberRoleDto {
    @IsEnum(WorkspaceRole, { message: 'Please provide a valid role' })
    role!: WorkspaceRole;
}

@InputType()
export class UpdateMemberRoleInput {
    @Field(() => WorkspaceRole)
    @IsEnum(WorkspaceRole, { message: 'Please provide a valid role' })
    role!: WorkspaceRole;
}
