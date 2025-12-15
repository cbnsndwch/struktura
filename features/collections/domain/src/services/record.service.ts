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
     * Bulk update records using MongoDB bulkWrite for better performance
     */
    async bulkUpdate(
        collectionId: string,
        dto: BulkUpdateRecordsDto,
        userId: string
    ): Promise<Record[]> {
        if (dto.updates.length === 0) {
            return [];
        }

        // Fetch existing records to merge data properly
        const updateIds = dto.updates.map(u => u.id);
        const existingRecords = await this.recordModel
            .find({ _id: { $in: updateIds }, collectionId })
            .exec();

        const recordMap = new Map(
            existingRecords.map(r => [r._id.toString(), r])
        );

        // Prepare bulk write operations
        const operations = dto.updates
            .filter(update => recordMap.has(update.id))
            .map(update => {
                const existing = recordMap.get(update.id);
                const mergedData = { ...existing!.data, ...update.data };

                return {
                    updateOne: {
                        filter: { _id: update.id, collectionId },
                        update: {
                            $set: {
                                data: mergedData,
                                modifiedBy: userId
                            },
                            $inc: { version: 1 }
                        }
                    }
                };
            });

        if (operations.length === 0) {
            return [];
        }

        await this.recordModel.bulkWrite(operations);

        // Fetch and return the updated records
        const updatedRecords = await this.recordModel
            .find({ _id: { $in: updateIds }, collectionId })
            .exec();

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
