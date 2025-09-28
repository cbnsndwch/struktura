import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { JwtAuthGuard, CurrentUserId } from '@cbnsndwch/struktura-auth-domain';
import { WorkspaceRole } from '@cbnsndwch/struktura-workspace-contracts';

import {
    Collection,
    CollectionDocument
} from '../entities/collections/collection.entity.js';
import {
    CreateCollectionDto,
    UpdateCollectionDto,
    CollectionTemplateDto
} from '../dto/collection.dto.js';
import { CollectionService } from '../services/collection.service.js';
import { WorkspaceGuard, WorkspaceRoles } from '../guards/workspace.guard.js';

@Resolver(() => Collection)
@UseGuards(JwtAuthGuard)
export class CollectionResolver {
    constructor(private readonly collectionService: CollectionService) {}

    @Mutation(() => Collection)
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
        WorkspaceRole.EDITOR
    ])
    async createCollection(
        @Args('input') input: CreateCollectionDto,
        @CurrentUserId() userId: string
    ): Promise<CollectionDocument> {
        return this.collectionService.create(input, userId);
    }

    @Query(() => [Collection])
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
        WorkspaceRole.EDITOR,
        WorkspaceRole.VIEWER
    ])
    async collectionsInWorkspace(
        @Args('workspaceId', { type: () => ID }) workspaceId: string
    ): Promise<CollectionDocument[]> {
        return this.collectionService.findAllInWorkspace(workspaceId);
    }

    @Query(() => Collection)
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
        WorkspaceRole.EDITOR,
        WorkspaceRole.VIEWER
    ])
    async collection(
        @Args('id', { type: () => ID }) id: string
    ): Promise<CollectionDocument> {
        return this.collectionService.findOne(id);
    }

    @Query(() => Collection)
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
        WorkspaceRole.EDITOR,
        WorkspaceRole.VIEWER
    ])
    async collectionBySlug(
        @Args('workspaceId', { type: () => ID }) workspaceId: string,
        @Args('slug') slug: string
    ): Promise<CollectionDocument> {
        return this.collectionService.findBySlug(workspaceId, slug);
    }

    @Mutation(() => Collection)
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
        WorkspaceRole.EDITOR
    ])
    async updateCollection(
        @Args('id', { type: () => ID }) id: string,
        @Args('input') input: UpdateCollectionDto,
        @CurrentUserId() userId: string
    ): Promise<CollectionDocument> {
        return this.collectionService.update(id, input, userId);
    }

    @Mutation(() => Boolean)
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([WorkspaceRole.OWNER, WorkspaceRole.ADMIN])
    async deleteCollection(
        @Args('id', { type: () => ID }) id: string,
        @CurrentUserId() userId: string
    ): Promise<boolean> {
        await this.collectionService.remove(id, userId);
        return true;
    }

    @Query(() => [CollectionTemplateDto])
    async collectionTemplates(): Promise<CollectionTemplateDto[]> {
        return this.collectionService.getTemplates();
    }
}
