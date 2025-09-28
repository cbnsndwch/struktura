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
import { WorkspaceRole } from '@cbnsndwch/struktura-workspace-contracts';

import {
    CollectionTemplateDto,
    CreateCollectionDto,
    FieldDefinitionDto,
    UpdateCollectionDto
} from '../dto/collection.dto.js';
import { CollectionService } from '../services/collection.service.js';
import { WorkspaceGuard, WorkspaceRoles } from '../guards/workspace.guard.js';

// Type definition for authenticated request
interface AuthenticatedRequest extends Request {
    user: {
        sub: string;
        email: string;
    };
}

@Controller('workspaces/:workspaceId/collections')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class CollectionController {
    constructor(private readonly collectionService: CollectionService) {}

    /**
     * Create new collection
     */
    @Post()
    @WorkspaceRoles([
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
        WorkspaceRole.EDITOR
    ])
    async create(
        @Param('workspaceId') workspaceId: string,
        @Body() createCollectionDto: CreateCollectionDto,
        @Request() req: AuthenticatedRequest
    ) {
        createCollectionDto.workspaceId = workspaceId;
        return this.collectionService.create(createCollectionDto, req.user.sub);
    }

    /**
     * Get all collections in workspace
     */
    @Get()
    @WorkspaceRoles([
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
        WorkspaceRole.EDITOR,
        WorkspaceRole.VIEWER
    ])
    async findAll(@Param('workspaceId') workspaceId: string) {
        return this.collectionService.findAllInWorkspace(workspaceId);
    }

    /**
     * Get collection by slug
     */
    @Get(':slug')
    @WorkspaceRoles([
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
        WorkspaceRole.EDITOR,
        WorkspaceRole.VIEWER
    ])
    async findBySlug(
        @Param('workspaceId') workspaceId: string,
        @Param('slug') slug: string
    ) {
        return this.collectionService.findBySlug(workspaceId, slug);
    }

    /**
     * Update collection
     */
    @Put(':id')
    @WorkspaceRoles([
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
        WorkspaceRole.EDITOR
    ])
    async update(
        @Param('id') id: string,
        @Body() updateCollectionDto: UpdateCollectionDto,
        @Request() req: AuthenticatedRequest
    ) {
        return this.collectionService.update(
            id,
            updateCollectionDto,
            req.user.sub
        );
    }

    /**
     * Delete collection
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @WorkspaceRoles([WorkspaceRole.OWNER, WorkspaceRole.ADMIN])
    async remove(
        @Param('id') id: string,
        @Request() req: AuthenticatedRequest
    ) {
        return this.collectionService.remove(id, req.user.sub);
    }

    /**
     * Add field to collection
     */
    @Post(':id/fields')
    @WorkspaceRoles([
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
        WorkspaceRole.EDITOR
    ])
    async addField(
        @Param('id') id: string,
        @Body() fieldDto: FieldDefinitionDto,
        @Request() req: AuthenticatedRequest
    ) {
        return this.collectionService.addField(id, fieldDto, req.user.sub);
    }

    /**
     * Update field in collection
     */
    @Put(':id/fields/:fieldName')
    @WorkspaceRoles([
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
        WorkspaceRole.EDITOR
    ])
    async updateField(
        @Param('id') id: string,
        @Param('fieldName') fieldName: string,
        @Body() fieldDto: FieldDefinitionDto,
        @Request() req: AuthenticatedRequest
    ) {
        return this.collectionService.updateField(
            id,
            fieldName,
            fieldDto,
            req.user.sub
        );
    }

    /**
     * Remove field from collection
     */
    @Delete(':id/fields/:fieldName')
    @HttpCode(HttpStatus.NO_CONTENT)
    @WorkspaceRoles([WorkspaceRole.OWNER, WorkspaceRole.ADMIN])
    async removeField(
        @Param('id') id: string,
        @Param('fieldName') fieldName: string,
        @Request() req: AuthenticatedRequest
    ) {
        return this.collectionService.removeField(id, fieldName, req.user.sub);
    }
}

@Controller('collection-templates')
@UseGuards(JwtAuthGuard)
export class CollectionTemplateController {
    constructor(private readonly collectionService: CollectionService) {}

    /**
     * Get collection templates
     */
    @Get()
    async getTemplates(): Promise<CollectionTemplateDto[]> {
        return this.collectionService.getTemplates();
    }
}
