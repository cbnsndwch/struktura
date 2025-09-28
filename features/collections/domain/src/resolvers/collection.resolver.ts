import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Logger } from '@nestjs/common';

import { Collection } from '../entities/collection.entity.js';
import { CollectionService } from '../services/collection.service.js';
import {
    CreateCollectionDto,
    UpdateCollectionDto,
    AddFieldDto,
    UpdateFieldDto,
    CollectionTemplateDto
} from '../dto/collection.dto.js';

@Resolver(() => Collection)
export class CollectionResolver {
    private readonly logger = new Logger(CollectionResolver.name);

    constructor(private readonly collectionService: CollectionService) {}

    @Query(() => [Collection], { name: 'collections' })
    async findAllCollections(
        @Args('workspaceId', { type: () => String, nullable: true })
        workspaceId?: string
    ): Promise<Collection[]> {
        return await this.collectionService.findAll(workspaceId);
    }

    @Query(() => Collection, { name: 'collection', nullable: true })
    async findCollectionById(
        @Args('id', { type: () => ID }) id: string
    ): Promise<Collection | null> {
        return await this.collectionService.findById(id);
    }

    @Query(() => Collection, { name: 'collectionBySlug', nullable: true })
    async findCollectionBySlug(
        @Args('slug') slug: string,
        @Args('workspaceId') workspaceId: string
    ): Promise<Collection | null> {
        return await this.collectionService.findBySlug(slug, workspaceId);
    }

    @Query(() => [CollectionTemplateDto], { name: 'collectionTemplates' })
    async getCollectionTemplates(): Promise<CollectionTemplateDto[]> {
        return await this.collectionService.getTemplates();
    }

    @Mutation(() => Collection)
    async createCollection(
        @Args('input') createCollectionDto: CreateCollectionDto
    ): Promise<Collection> {
        return await this.collectionService.create(createCollectionDto);
    }

    @Mutation(() => Collection)
    async updateCollection(
        @Args('id', { type: () => ID }) id: string,
        @Args('input') updateCollectionDto: UpdateCollectionDto
    ): Promise<Collection> {
        return await this.collectionService.update(id, updateCollectionDto);
    }

    @Mutation(() => Boolean)
    async deleteCollection(
        @Args('id', { type: () => ID }) id: string
    ): Promise<boolean> {
        await this.collectionService.delete(id);
        return true;
    }

    @Mutation(() => Collection)
    async addFieldToCollection(
        @Args('collectionId', { type: () => ID }) collectionId: string,
        @Args('input') addFieldDto: AddFieldDto
    ): Promise<Collection> {
        return await this.collectionService.addField(collectionId, addFieldDto);
    }

    @Mutation(() => Collection)
    async updateCollectionField(
        @Args('collectionId', { type: () => ID }) collectionId: string,
        @Args('fieldName') fieldName: string,
        @Args('input') updateFieldDto: UpdateFieldDto
    ): Promise<Collection> {
        return await this.collectionService.updateField(
            collectionId,
            fieldName,
            updateFieldDto
        );
    }

    @Mutation(() => Collection)
    async removeFieldFromCollection(
        @Args('collectionId', { type: () => ID }) collectionId: string,
        @Args('fieldName') fieldName: string
    ): Promise<Collection> {
        return await this.collectionService.removeField(
            collectionId,
            fieldName
        );
    }

    @Mutation(() => Collection)
    async duplicateCollection(
        @Args('id', { type: () => ID }) id: string,
        @Args('newName', { nullable: true }) newName?: string
    ): Promise<Collection> {
        return await this.collectionService.duplicateCollection(id, newName);
    }
}
