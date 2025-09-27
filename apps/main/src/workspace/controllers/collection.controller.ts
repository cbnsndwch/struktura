import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Request,
    UseGuards
} from '@nestjs/common';

import { JwtAuthGuard } from '@cbnsndwch/struktura-auth-domain';

import {
    CollectionTemplateDto,
    CreateCollectionDto,
    FieldDto,
    UpdateCollectionDto
} from '../dto/collection.dto.js';
import { CollectionService } from '../services/collection.service.js';

@Controller('workspaces/:workspaceId/collections')
@UseGuards(JwtAuthGuard)
export class CollectionController {
    constructor(private readonly collectionService: CollectionService) {}

    // Create new collection
    @Post()
    async create(
        @Param('workspaceId') workspaceId: string,
        @Body() createCollectionDto: CreateCollectionDto,
        @Request() req: AuthenticatedRequest
    ) {
        createCollectionDto.workspace = workspaceId;
        return this.collectionService.create(createCollectionDto, req.user!.id);
    }

    // Get all collections in workspace
    @Get()
    async findAll(@Param('workspaceId') workspaceId: string) {
        return this.collectionService.findByWorkspace(workspaceId);
    }

    // Get collection by slug
    @Get(':slug')
    async findBySlug(
        @Param('workspaceId') workspaceId: string,
        @Param('slug') slug: string
    ) {
        return this.collectionService.findBySlug(workspaceId, slug);
    }

    // Update collection
    @Put(':slug')
    async update(
        @Param('workspaceId') workspaceId: string,
        @Param('slug') slug: string,
        @Body() updateCollectionDto: UpdateCollectionDto
    ) {
        const collection = await this.collectionService.findBySlug(
            workspaceId,
            slug
        );
        return this.collectionService.update(
            collection.id,
            updateCollectionDto
        );
    }

    // Delete collection
    @Delete(':slug')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
        @Param('workspaceId') workspaceId: string,
        @Param('slug') slug: string
    ) {
        const collection = await this.collectionService.findBySlug(
            workspaceId,
            slug
        );
        await this.collectionService.delete(collection.id);
    }

    // Add field to collection
    @Post(':slug/fields')
    async addField(
        @Param('workspaceId') workspaceId: string,
        @Param('slug') slug: string,
        @Body() fieldDto: FieldDto
    ) {
        const collection = await this.collectionService.findBySlug(
            workspaceId,
            slug
        );
        return this.collectionService.addField(collection.id, fieldDto);
    }

    // Update field in collection
    @Put(':slug/fields/:fieldId')
    async updateField(
        @Param('workspaceId') workspaceId: string,
        @Param('slug') slug: string,
        @Param('fieldId') fieldId: string,
        @Body() fieldUpdate: Partial<FieldDto>
    ) {
        const collection = await this.collectionService.findBySlug(
            workspaceId,
            slug
        );
        return this.collectionService.updateField(
            collection.id,
            fieldId,
            fieldUpdate
        );
    }

    // Remove field from collection
    @Delete(':slug/fields/:fieldId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeField(
        @Param('workspaceId') workspaceId: string,
        @Param('slug') slug: string,
        @Param('fieldId') fieldId: string
    ) {
        const collection = await this.collectionService.findBySlug(
            workspaceId,
            slug
        );
        await this.collectionService.removeField(collection.id, fieldId);
    }

    // Reorder fields
    @Put(':slug/fields/reorder')
    async reorderFields(
        @Param('workspaceId') workspaceId: string,
        @Param('slug') slug: string,
        @Body() { fieldOrder }: { fieldOrder: string[] }
    ) {
        const collection = await this.collectionService.findBySlug(
            workspaceId,
            slug
        );
        return this.collectionService.reorderFields(collection.id, fieldOrder);
    }
}

// Separate controller for templates (not workspace-specific)
@Controller('collections/templates')
export class CollectionTemplateController {
    constructor(private readonly collectionService: CollectionService) {}

    @Get()
    async getTemplates(): Promise<CollectionTemplateDto[]> {
        return this.collectionService.getTemplates();
    }
}
