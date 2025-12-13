import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import {
    BetterAuthGuard,
    BetterAuthUserId
} from '@cbnsndwch/struktura-auth-domain';

import {
    Workspace,
    WorkspaceDocument,
    WorkspaceRole
} from '../entities/index.js';
import { WorkspaceService } from '../services/workspace.service.js';
import { WorkspaceGuard, WorkspaceRoles } from '../guards/index.js';
import {
    CreateWorkspaceInput,
    UpdateWorkspaceInput,
    UpdateWorkspaceSettingsInput,
    InviteMemberInput,
    UpdateMemberRoleInput
} from '../dto/index.js';

@Resolver(() => Workspace)
@UseGuards(BetterAuthGuard)
export class WorkspaceResolver {
    constructor(private readonly workspaceService: WorkspaceService) {}

    @Mutation(() => Workspace)
    async createWorkspace(
        @Args('input') input: CreateWorkspaceInput,
        @BetterAuthUserId() userId: string
    ): Promise<WorkspaceDocument> {
        return this.workspaceService.create(input, userId);
    }

    @Query(() => [Workspace])
    async workspaces(
        @BetterAuthUserId() userId: string
    ): Promise<WorkspaceDocument[]> {
        return this.workspaceService.findAllForUser(userId);
    }

    @Query(() => Workspace)
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
        WorkspaceRole.EDITOR,
        WorkspaceRole.VIEWER
    ])
    async workspace(@Args('id') id: string): Promise<WorkspaceDocument> {
        return this.workspaceService.findOne(id);
    }

    @Query(() => Workspace)
    async workspaceBySlug(
        @Args('slug') slug: string
    ): Promise<WorkspaceDocument> {
        return this.workspaceService.findBySlug(slug);
    }

    @Mutation(() => Workspace)
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([WorkspaceRole.OWNER, WorkspaceRole.ADMIN])
    async updateWorkspace(
        @Args('id') id: string,
        @Args('input') input: UpdateWorkspaceInput,
        @BetterAuthUserId() userId: string
    ): Promise<WorkspaceDocument> {
        return this.workspaceService.update(id, input, userId);
    }

    @Mutation(() => Workspace)
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([WorkspaceRole.OWNER, WorkspaceRole.ADMIN])
    async updateWorkspaceSettings(
        @Args('id') id: string,
        @Args('input') input: UpdateWorkspaceSettingsInput,
        @BetterAuthUserId() userId: string
    ): Promise<WorkspaceDocument> {
        return this.workspaceService.updateSettings(id, input, userId);
    }

    @Mutation(() => Boolean)
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([WorkspaceRole.OWNER])
    async deleteWorkspace(
        @Args('id') id: string,
        @BetterAuthUserId() userId: string
    ): Promise<boolean> {
        await this.workspaceService.remove(id, userId);
        return true;
    }

    @Mutation(() => Workspace)
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([WorkspaceRole.OWNER, WorkspaceRole.ADMIN])
    async inviteMember(
        @Args('workspaceId') workspaceId: string,
        @Args('input') input: InviteMemberInput,
        @BetterAuthUserId() userId: string
    ): Promise<WorkspaceDocument> {
        return this.workspaceService.inviteMember(workspaceId, input, userId);
    }

    @Mutation(() => Workspace)
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([WorkspaceRole.OWNER, WorkspaceRole.ADMIN])
    async updateMemberRole(
        @Args('workspaceId') workspaceId: string,
        @Args('memberId') memberId: string,
        @Args('input') input: UpdateMemberRoleInput,
        @BetterAuthUserId() userId: string
    ): Promise<WorkspaceDocument> {
        return this.workspaceService.updateMemberRole(
            workspaceId,
            memberId,
            input,
            userId
        );
    }

    @Mutation(() => Workspace)
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([WorkspaceRole.OWNER, WorkspaceRole.ADMIN])
    async removeMember(
        @Args('workspaceId') workspaceId: string,
        @Args('memberId') memberId: string,
        @BetterAuthUserId() userId: string
    ): Promise<WorkspaceDocument> {
        return this.workspaceService.removeMember(
            workspaceId,
            memberId,
            userId
        );
    }

    @Query(() => String, { nullable: true })
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
        WorkspaceRole.EDITOR,
        WorkspaceRole.VIEWER
    ])
    async userRoleInWorkspace(
        @Args('workspaceId') workspaceId: string,
        @BetterAuthUserId() userId: string
    ): Promise<WorkspaceRole | null> {
        return this.workspaceService.getUserRole(workspaceId, userId);
    }
}
