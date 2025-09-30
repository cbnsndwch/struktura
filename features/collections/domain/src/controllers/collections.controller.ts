import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus
} from '@nestjs/common';

import { Collection } from '../entities/collection.entity.js';
import { CollectionService } from '../services/collection.service.js';
import {
    CreateCollectionDto,
    UpdateCollectionDto,
    AddFieldDto,
    UpdateFieldDto
} from '../dto/index.js';

@Controller('api/collections')
export class CollectionsController {
    constructor(private readonly collectionService: CollectionService) {}

    @Get()
    async findAll(
        @Query('workspaceId') workspaceId?: string
    ): Promise<Collection[]> {
        return await this.collectionService.findAll(workspaceId);
    }

    @Get(':id')
    async findById(@Param('id') id: string): Promise<Collection> {
        const collection = await this.collectionService.findById(id);
        if (!collection) {
            throw new Error('Collection not found');
        }
        return collection;
    }

    @Get('slug/:slug')
    async findBySlug(
        @Param('slug') slug: string,
        @Query('workspaceId') workspaceId: string
    ): Promise<Collection> {
        const collection = await this.collectionService.findBySlug(
            slug,
            workspaceId
        );
        if (!collection) {
            throw new Error('Collection not found');
        }
        return collection;
    }

    @Get('templates/list')
    async getTemplates() {
        return await this.collectionService.getTemplates();
    }

    @Post()
    async create(
        @Body() createCollectionDto: CreateCollectionDto
    ): Promise<Collection> {
        return await this.collectionService.create(createCollectionDto);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateCollectionDto: UpdateCollectionDto
    ): Promise<Collection> {
        return await this.collectionService.update(id, updateCollectionDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string): Promise<void> {
        await this.collectionService.delete(id);
    }

    @Post(':id/fields')
    async addField(
        @Param('id') collectionId: string,
        @Body() addFieldDto: AddFieldDto
    ): Promise<Collection> {
        return await this.collectionService.addField(collectionId, addFieldDto);
    }

    @Patch(':id/fields/:fieldName')
    async updateField(
        @Param('id') collectionId: string,
        @Param('fieldName') fieldName: string,
        @Body() updateFieldDto: UpdateFieldDto
    ): Promise<Collection> {
        return await this.collectionService.updateField(
            collectionId,
            fieldName,
            updateFieldDto
        );
    }

    @Delete(':id/fields/:fieldName')
    async removeField(
        @Param('id') collectionId: string,
        @Param('fieldName') fieldName: string
    ): Promise<Collection> {
        return await this.collectionService.removeField(
            collectionId,
            fieldName
        );
    }

    @Post(':id/duplicate')
    async duplicate(
        @Param('id') id: string,
        @Body('newName') newName?: string
    ): Promise<Collection> {
        return await this.collectionService.duplicateCollection(id, newName);
    }
}
