import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { CollectionService } from '../services/collection.service.js';
import { 
    CreateCollectionDto, 
    UpdateCollectionDto, 
    FieldDto,
    CollectionTemplateDto 
} from '../dto/collection.dto.js';
import { CollectionDocument } from '../schemas/collection.schema.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';

@Controller('workspaces/:workspaceId/collections')
@UseGuards(JwtAuthGuard)
export class CollectionController {
    constructor(private readonly collectionService: CollectionService) {}

    // Create new collection
    @Post()
    async create(
        @Param('workspaceId') workspaceId: string,
        @Body() createCollectionDto: CreateCollectionDto,
        @Request() req: any
    ) {
        createCollectionDto.workspace = workspaceId;
        return this.collectionService.create(createCollectionDto, req.user.id);
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
        const collection = await this.collectionService.findBySlug(workspaceId, slug);
        return this.collectionService.update((collection as any)._id.toString(), updateCollectionDto);
    }

    // Delete collection
    @Delete(':slug')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
        @Param('workspaceId') workspaceId: string,
        @Param('slug') slug: string
    ) {
        const collection = await this.collectionService.findBySlug(workspaceId, slug);
        await this.collectionService.delete((collection as any)._id.toString());
    }

    // Add field to collection
    @Post(':slug/fields')
    async addField(
        @Param('workspaceId') workspaceId: string,
        @Param('slug') slug: string,
        @Body() fieldDto: FieldDto
    ) {
        const collection = await this.collectionService.findBySlug(workspaceId, slug);
        return this.collectionService.addField((collection as any)._id.toString(), fieldDto as any);
    }

    // Update field in collection
    @Put(':slug/fields/:fieldId')
    async updateField(
        @Param('workspaceId') workspaceId: string,
        @Param('slug') slug: string,
        @Param('fieldId') fieldId: string,
        @Body() fieldUpdate: Partial<FieldDto>
    ) {
        const collection = await this.collectionService.findBySlug(workspaceId, slug);
        return this.collectionService.updateField((collection as any)._id.toString(), fieldId, fieldUpdate);
    }

    // Remove field from collection
    @Delete(':slug/fields/:fieldId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeField(
        @Param('workspaceId') workspaceId: string,
        @Param('slug') slug: string,
        @Param('fieldId') fieldId: string
    ) {
        const collection = await this.collectionService.findBySlug(workspaceId, slug);
        await this.collectionService.removeField((collection as any)._id.toString(), fieldId);
    }

    // Reorder fields
    @Put(':slug/fields/reorder')
    async reorderFields(
        @Param('workspaceId') workspaceId: string,
        @Param('slug') slug: string,
        @Body() { fieldOrder }: { fieldOrder: string[] }
    ) {
        const collection = await this.collectionService.findBySlug(workspaceId, slug);
        return this.collectionService.reorderFields((collection as any)._id.toString(), fieldOrder);
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