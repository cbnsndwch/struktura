import { IsString, IsEnum, IsEmail, IsOptional } from 'class-validator';

export enum WorkspaceRole {
    OWNER = 'owner',
    ADMIN = 'admin',
    EDITOR = 'editor',
    VIEWER = 'viewer'
}

export class InviteMemberDto {
    @IsEmail()
    email!: string;

    @IsEnum(WorkspaceRole)
    role!: WorkspaceRole;

    @IsOptional()
    @IsString()
    inviteMessage?: string;
}

export class UpdateMemberRoleDto {
    @IsEnum(WorkspaceRole)
    role!: WorkspaceRole;
}
