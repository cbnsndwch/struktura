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
    HttpStatus,
    Req,
    NotFoundException,
    UseGuards
} from '@nestjs/common';
import { Request } from 'express';

import { BetterAuthGuard } from '@cbnsndwch/struktura-auth-domain';

import { Record } from '../entities/record.entity.js';
import { RecordService } from '../services/record.service.js';
import {
    CreateRecordDto,
    UpdateRecordDto,
    BulkCreateRecordsDto,
    BulkUpdateRecordsDto,
    BulkDeleteRecordsDto,
    QueryRecordsDto
} from '../dto/record.dto.js';

@Controller('api/collections/:collectionId/records')
@UseGuards(BetterAuthGuard)
export class RecordsController {
    constructor(private readonly recordService: RecordService) {}

    @Get('count')
    async count(
        @Param('collectionId') collectionId: string,
        @Query('filter') filterStr?: string
    ): Promise<{ count: number }> {
        let filter: Record<string, unknown> | undefined;

        if (filterStr) {
            try {
                filter = JSON.parse(filterStr);
            } catch {
                // Ignore invalid filter JSON
            }
        }

        const count = await this.recordService.count(collectionId, filter);
        return { count };
    }

    @Get(':id')
    async findById(
        @Param('collectionId') collectionId: string,
        @Param('id') id: string
    ): Promise<Record> {
        const record = await this.recordService.findById(collectionId, id);
        if (!record) {
            throw new NotFoundException(
                `Record ${id} not found in collection ${collectionId}`
            );
        }
        return record;
    }

    @Get()
    async findAll(
        @Param('collectionId') collectionId: string,
        @Query('filter') filterStr?: string,
        @Query('sort') sortStr?: string,
        @Query('limit') limit?: number,
        @Query('skip') skip?: number,
        @Query('select') selectStr?: string
    ): Promise<Record[]> {
        const query: QueryRecordsDto = {};

        if (filterStr) {
            try {
                query.filter = JSON.parse(filterStr);
            } catch {
                // Ignore invalid filter JSON
            }
        }

        if (sortStr) {
            try {
                query.sort = JSON.parse(sortStr);
            } catch {
                // Ignore invalid sort JSON
            }
        }

        if (limit) {
            query.limit = Number(limit);
        }

        if (skip) {
            query.skip = Number(skip);
        }

        if (selectStr) {
            query.select = selectStr.split(',');
        }

        return await this.recordService.findAll(collectionId, query);
    }

    @Post()
    async create(
        @Param('collectionId') collectionId: string,
        @Body() createRecordDto: CreateRecordDto,
        @Req() req: Request
    ): Promise<Record> {
        // Get user ID from request (assuming it's set by auth middleware)
        const userId = (req as any).user?.id || 'system';
        return await this.recordService.create(
            collectionId,
            createRecordDto,
            userId
        );
    }

    @Patch(':id')
    async update(
        @Param('collectionId') collectionId: string,
        @Param('id') id: string,
        @Body() updateRecordDto: UpdateRecordDto,
        @Req() req: Request
    ): Promise<Record> {
        const userId = (req as any).user?.id || 'system';
        return await this.recordService.update(
            collectionId,
            id,
            updateRecordDto,
            userId
        );
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
        @Param('collectionId') collectionId: string,
        @Param('id') id: string
    ): Promise<void> {
        await this.recordService.delete(collectionId, id);
    }

    @Post('bulk')
    async bulkCreate(
        @Param('collectionId') collectionId: string,
        @Body() bulkCreateDto: BulkCreateRecordsDto,
        @Req() req: Request
    ): Promise<Record[]> {
        const userId = (req as any).user?.id || 'system';
        return await this.recordService.bulkCreate(
            collectionId,
            bulkCreateDto,
            userId
        );
    }

    @Patch('bulk')
    async bulkUpdate(
        @Param('collectionId') collectionId: string,
        @Body() bulkUpdateDto: BulkUpdateRecordsDto,
        @Req() req: Request
    ): Promise<Record[]> {
        const userId = (req as any).user?.id || 'system';
        return await this.recordService.bulkUpdate(
            collectionId,
            bulkUpdateDto,
            userId
        );
    }

    @Post('bulk-delete')
    @HttpCode(HttpStatus.NO_CONTENT)
    async bulkDelete(
        @Param('collectionId') collectionId: string,
        @Body() bulkDeleteDto: BulkDeleteRecordsDto
    ): Promise<void> {
        await this.recordService.bulkDelete(collectionId, bulkDeleteDto);
    }
}
