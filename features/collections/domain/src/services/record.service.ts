import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Record, RecordDocument } from '../entities/record.entity.js';
import {
    CreateRecordDto,
    UpdateRecordDto,
    BulkCreateRecordsDto,
    BulkUpdateRecordsDto,
    BulkDeleteRecordsDto,
    QueryRecordsDto
} from '../dto/record.dto.js';

@Injectable()
export class RecordService {
    constructor(
        @InjectModel(Record.name)
        private readonly recordModel: Model<RecordDocument>
    ) {}

    /**
     * Get all records for a collection with optional filtering, sorting, and pagination
     */
    async findAll(
        collectionId: string,
        query?: QueryRecordsDto
    ): Promise<Record[]> {
        const filter = { collectionId, ...(query?.filter || {}) };
        
        let queryBuilder = this.recordModel.find(filter);

        if (query?.sort) {
            queryBuilder = queryBuilder.sort(query.sort);
        }

        if (query?.skip) {
            queryBuilder = queryBuilder.skip(query.skip);
        }

        if (query?.limit) {
            queryBuilder = queryBuilder.limit(query.limit);
        }

        if (query?.select) {
            queryBuilder = queryBuilder.select(query.select.join(' '));
        }

        return await queryBuilder.exec();
    }

    /**
     * Count records in a collection
     */
    async count(
        collectionId: string,
        filter?: Record<string, unknown>
    ): Promise<number> {
        return await this.recordModel
            .countDocuments({ collectionId, ...filter })
            .exec();
    }

    /**
     * Find a single record by ID
     */
    async findById(
        collectionId: string,
        recordId: string
    ): Promise<Record | null> {
        return await this.recordModel
            .findOne({ _id: recordId, collectionId })
            .exec();
    }

    /**
     * Create a new record
     */
    async create(
        collectionId: string,
        dto: CreateRecordDto,
        userId: string
    ): Promise<Record> {
        const record = new this.recordModel({
            collectionId,
            data: dto.data,
            createdBy: userId,
            version: 1
        });

        return await record.save();
    }

    /**
     * Update a record
     */
    async update(
        collectionId: string,
        recordId: string,
        dto: UpdateRecordDto,
        userId: string
    ): Promise<Record> {
        const record = await this.findById(collectionId, recordId);

        if (!record) {
            throw new NotFoundException(
                `Record ${recordId} not found in collection ${collectionId}`
            );
        }

        // Merge the updated data with existing data
        record.data = { ...record.data, ...dto.data };
        record.modifiedBy = userId;
        record.version += 1;

        return await record.save();
    }

    /**
     * Delete a record
     */
    async delete(collectionId: string, recordId: string): Promise<void> {
        const result = await this.recordModel
            .deleteOne({ _id: recordId, collectionId })
            .exec();

        if (result.deletedCount === 0) {
            throw new NotFoundException(
                `Record ${recordId} not found in collection ${collectionId}`
            );
        }
    }

    /**
     * Bulk create records
     */
    async bulkCreate(
        collectionId: string,
        dto: BulkCreateRecordsDto,
        userId: string
    ): Promise<Record[]> {
        const records = dto.records.map(
            record =>
                new this.recordModel({
                    collectionId,
                    data: record.data,
                    createdBy: userId,
                    version: 1
                })
        );

        return await this.recordModel.insertMany(records);
    }

    /**
     * Bulk update records
     */
    async bulkUpdate(
        collectionId: string,
        dto: BulkUpdateRecordsDto,
        userId: string
    ): Promise<Record[]> {
        const updatedRecords: Record[] = [];

        for (const update of dto.updates) {
            const record = await this.findById(collectionId, update.id);

            if (record) {
                record.data = { ...record.data, ...update.data };
                record.modifiedBy = userId;
                record.version += 1;
                const saved = await record.save();
                updatedRecords.push(saved);
            }
        }

        return updatedRecords;
    }

    /**
     * Bulk delete records
     */
    async bulkDelete(
        collectionId: string,
        dto: BulkDeleteRecordsDto
    ): Promise<void> {
        await this.recordModel
            .deleteMany({ _id: { $in: dto.ids }, collectionId })
            .exec();
    }
}
