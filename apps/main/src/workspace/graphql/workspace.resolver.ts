import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { WorkspaceService } from '../services/workspace.service.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { WorkspaceGuard, WorkspaceRoles } from '../guards/workspace.guard.js';
import { WorkspaceRole } from '../dto/index.js';
import { WorkspaceDocument } from '../schemas/workspace.schema.js';
import {
    Workspace,
    CreateWorkspaceInput,
    UpdateWorkspaceInput,
    UpdateWorkspaceSettingsInput,
    InviteMemberInput,
    UpdateMemberRoleInput
} from './workspace.types.js';

@Resolver(() => Workspace)
@UseGuards(JwtAuthGuard)
export class WorkspaceResolver {
    constructor(private readonly workspaceService: WorkspaceService) {}

    @Mutation(() => Workspace)
    async createWorkspace(
        @Args('input') input: CreateWorkspaceInput,
        @Context() context: any
    ): Promise<WorkspaceDocument> {
        const userId = context.req.user.sub;
        return this.workspaceService.create(input, userId);
    }

    @Query(() => [Workspace])
    async workspaces(@Context() context: any): Promise<WorkspaceDocument[]> {
        const userId = context.req.user.sub;
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
    async workspaceBySlug(@Args('slug') slug: string): Promise<WorkspaceDocument> {
        return this.workspaceService.findBySlug(slug);
    }

    @Mutation(() => Workspace)
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([WorkspaceRole.OWNER, WorkspaceRole.ADMIN])
    async updateWorkspace(
        @Args('id') id: string,
        @Args('input') input: UpdateWorkspaceInput,
        @Context() context: any
    ): Promise<WorkspaceDocument> {
        const userId = context.req.user.sub;
        return this.workspaceService.update(id, input, userId);
    }

    @Mutation(() => Workspace)
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([WorkspaceRole.OWNER, WorkspaceRole.ADMIN])
    async updateWorkspaceSettings(
        @Args('id') id: string,
        @Args('input') input: UpdateWorkspaceSettingsInput,
        @Context() context: any
    ): Promise<WorkspaceDocument> {
        const userId = context.req.user.sub;
        return this.workspaceService.updateSettings(id, input, userId);
    }

    @Mutation(() => Boolean)
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([WorkspaceRole.OWNER])
    async deleteWorkspace(
        @Args('id') id: string,
        @Context() context: any
    ): Promise<boolean> {
        const userId = context.req.user.sub;
        await this.workspaceService.remove(id, userId);
        return true;
    }

    @Mutation(() => Workspace)
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([WorkspaceRole.OWNER, WorkspaceRole.ADMIN])
    async inviteMember(
        @Args('workspaceId') workspaceId: string,
        @Args('input') input: InviteMemberInput,
        @Context() context: any
    ): Promise<WorkspaceDocument> {
        const userId = context.req.user.sub;
        return this.workspaceService.inviteMember(workspaceId, input, userId);
    }

    @Mutation(() => Workspace)
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([WorkspaceRole.OWNER, WorkspaceRole.ADMIN])
    async updateMemberRole(
        @Args('workspaceId') workspaceId: string,
        @Args('memberId') memberId: string,
        @Args('input') input: UpdateMemberRoleInput,
        @Context() context: any
    ): Promise<WorkspaceDocument> {
        const userId = context.req.user.sub;
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
        @Context() context: any
    ): Promise<WorkspaceDocument> {
        const userId = context.req.user.sub;
        return this.workspaceService.removeMember(workspaceId, memberId, userId);
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
        @Context() context: any
    ): Promise<WorkspaceRole | null> {
        const userId = context.req.user.sub;
        return this.workspaceService.getUserRole(workspaceId, userId);
    }
}