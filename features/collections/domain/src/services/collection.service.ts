import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
    CreateCollectionData,
    UpdateCollectionData,
    AddFieldData,
    UpdateFieldData,
    CollectionTemplate,
    CollectionNotFoundError,
    FieldNotFoundError,
    DuplicateFieldError,
    ValidationError,
    FieldType
} from '@cbnsndwch/struktura-collections-contracts';

import {
    Collection,
    CollectionDocument
} from '../entities/collection.entity.js';
import { FieldDefinition } from '../entities/field-definition.entity.js';

@Injectable()
export class CollectionService {
    private readonly logger = new Logger(CollectionService.name);

    constructor(
        @InjectModel(Collection.name)
        private readonly collectionModel: Model<CollectionDocument>
    ) {}

    async findAll(workspaceId?: string): Promise<CollectionDocument[]> {
        const filter = workspaceId ? { workspaceId } : {};
        return await this.collectionModel.find(filter).exec();
    }

    async findByWorkspace(workspaceId: string): Promise<CollectionDocument[]> {
        return await this.collectionModel.find({ workspaceId }).exec();
    }

    async findById(id: string): Promise<CollectionDocument | null> {
        return await this.collectionModel.findById(id).exec();
    }

    async findBySlug(
        workspaceId: string,
        slug: string
    ): Promise<CollectionDocument | null> {
        return await this.collectionModel.findOne({ slug, workspaceId }).exec();
    }

    async create(data: CreateCollectionData): Promise<CollectionDocument> {
        try {
            // Auto-generate slug if not provided
            if (!data.slug) {
                data.slug = data.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            }

            // Check for duplicate slug in workspace
            const existing = await this.findBySlug(data.slug, data.workspaceId);
            if (existing) {
                throw new ConflictException(
                    `Collection with slug "${data.slug}" already exists in this workspace`
                );
            }

            const collection = new this.collectionModel(data);
            return await collection.save();
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            this.logger.error('Failed to create collection', error);
            throw new ValidationError('Failed to create collection');
        }
    }

    async update(id: string, data: UpdateCollectionData): Promise<Collection> {
        const collection = await this.findById(id);
        if (!collection) {
            throw new CollectionNotFoundError(id);
        }

        try {
            // Check slug uniqueness if slug is being updated
            if (data.slug && data.slug !== collection.slug) {
                const existing = await this.findBySlug(
                    data.slug,
                    collection.workspaceId
                );
                if (existing && existing.id !== id) {
                    throw new ConflictException(
                        `Collection with slug "${data.slug}" already exists in this workspace`
                    );
                }
            }

            Object.assign(collection, data, { updatedAt: new Date() });
            return await collection.save();
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            this.logger.error('Failed to update collection', error);
            throw new ValidationError('Failed to update collection');
        }
    }

    async delete(id: string): Promise<void> {
        const result = await this.collectionModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new CollectionNotFoundError(id);
        }
    }

    async addField(id: string, fieldData: AddFieldData): Promise<Collection> {
        const collection = await this.findById(id);
        if (!collection) {
            throw new CollectionNotFoundError(id);
        }

        // Check for duplicate field name
        const existingField = collection.fields?.find(
            field => field.name === fieldData.name
        );
        if (existingField) {
            throw new DuplicateFieldError(fieldData.name);
        }

        try {
            const newField: FieldDefinition = {
                name: fieldData.name,
                type: fieldData.type,
                description: fieldData.description,
                required: fieldData.required || false,
                defaultValue: fieldData.defaultValue,
                validations: fieldData.validations || [],
                options: fieldData.options
            };

            if (!collection.fields) {
                collection.fields = [];
            }
            collection.fields.push(newField);
            collection.updatedAt = new Date();

            return await collection.save();
        } catch (error) {
            this.logger.error('Failed to add field to collection', error);
            throw new ValidationError('Failed to add field to collection');
        }
    }

    async updateField(
        id: string,
        fieldName: string,
        fieldData: UpdateFieldData
    ): Promise<Collection> {
        const collection = await this.findById(id);
        if (!collection) {
            throw new CollectionNotFoundError(id);
        }

        const fieldIndex = collection.fields?.findIndex(
            field => field.name === fieldName
        );
        if (fieldIndex === undefined || fieldIndex === -1) {
            throw new FieldNotFoundError(fieldName, id);
        }

        try {
            // Check for duplicate field name if name is being changed
            if (fieldData.name && fieldData.name !== fieldName) {
                const existingField = collection.fields?.find(
                    field => field.name === fieldData.name
                );
                if (existingField) {
                    throw new DuplicateFieldError(fieldData.name);
                }
            }

            // Update the field - ensure all required fields are present
            const currentField = collection.fields![fieldIndex];
            if (!currentField) {
                throw new FieldNotFoundError(fieldName, id);
            }

            const updatedField = {
                name: fieldData.name || currentField.name,
                type: fieldData.type || currentField.type,
                description:
                    fieldData.description !== undefined
                        ? fieldData.description
                        : currentField.description,
                required:
                    fieldData.required !== undefined
                        ? fieldData.required
                        : currentField.required,
                defaultValue:
                    fieldData.defaultValue !== undefined
                        ? fieldData.defaultValue
                        : currentField.defaultValue,
                validations: fieldData.validations || currentField.validations,
                options:
                    fieldData.options !== undefined
                        ? fieldData.options
                        : currentField.options
            };
            collection.fields![fieldIndex] = updatedField;
            collection.updatedAt = new Date();

            return await collection.save();
        } catch (error) {
            if (error instanceof DuplicateFieldError) {
                throw error;
            }
            this.logger.error('Failed to update field in collection', error);
            throw new ValidationError('Failed to update field in collection');
        }
    }

    async removeField(id: string, fieldName: string): Promise<Collection> {
        const collection = await this.findById(id);
        if (!collection) {
            throw new CollectionNotFoundError(id);
        }

        const fieldIndex = collection.fields?.findIndex(
            field => field.name === fieldName
        );
        if (fieldIndex === undefined || fieldIndex === -1) {
            throw new FieldNotFoundError(fieldName, id);
        }

        try {
            collection.fields!.splice(fieldIndex, 1);
            collection.updatedAt = new Date();
            return await collection.save();
        } catch (error) {
            this.logger.error('Failed to remove field from collection', error);
            throw new ValidationError('Failed to remove field from collection');
        }
    }

    async getTemplates(): Promise<CollectionTemplate[]> {
        // This would typically come from a database or configuration
        // For now, return some predefined templates
        return [
            {
                id: 'basic-table',
                name: 'Basic Table',
                description: 'A simple table with common fields',
                category: 'Basic',
                icon: 'table',
                fields: [
                    {
                        name: 'name',
                        type: FieldType.TEXT,
                        description: 'Item name',
                        required: true,
                        validations: []
                    },
                    {
                        name: 'description',
                        type: FieldType.TEXT,
                        description: 'Item description',
                        required: false,
                        validations: []
                    },
                    {
                        name: 'status',
                        type: FieldType.SELECT,
                        description: 'Current status',
                        required: true,
                        validations: [],
                        options: {
                            choices: [
                                { label: 'Active', value: 'active' },
                                { label: 'Inactive', value: 'inactive' }
                            ]
                        }
                    }
                ]
            },
            {
                id: 'task-management',
                name: 'Task Management',
                description: 'Task management with priority and assignments',
                category: 'Project Management',
                icon: 'tasks',
                fields: [
                    {
                        name: 'title',
                        type: FieldType.TEXT,
                        description: 'Task title',
                        required: true,
                        validations: [
                            { type: 'required', message: 'Title is required' }
                        ]
                    },
                    {
                        name: 'description',
                        type: FieldType.TEXT,
                        description: 'Task description',
                        required: false,
                        validations: []
                    },
                    {
                        name: 'priority',
                        type: FieldType.SELECT,
                        description: 'Task priority',
                        required: true,
                        validations: [],
                        options: {
                            choices: [
                                { label: 'Low', value: 'low', color: 'green' },
                                {
                                    label: 'Medium',
                                    value: 'medium',
                                    color: 'yellow'
                                },
                                { label: 'High', value: 'high', color: 'red' }
                            ]
                        }
                    },
                    {
                        name: 'assignee',
                        type: FieldType.REFERENCE,
                        description: 'Assigned user',
                        required: false,
                        validations: []
                    },
                    {
                        name: 'dueDate',
                        type: FieldType.DATE,
                        description: 'Due date',
                        required: false,
                        validations: []
                    },
                    {
                        name: 'status',
                        type: FieldType.SELECT,
                        description: 'Task status',
                        required: true,
                        defaultValue: 'todo',
                        validations: [],
                        options: {
                            choices: [
                                { label: 'To Do', value: 'todo' },
                                { label: 'In Progress', value: 'in-progress' },
                                { label: 'Done', value: 'done' }
                            ]
                        }
                    }
                ]
            }
        ];
    }

    async duplicateCollection(
        id: string,
        newName?: string
    ): Promise<Collection> {
        const originalCollection = await this.findById(id);
        if (!originalCollection) {
            throw new CollectionNotFoundError(id);
        }

        const duplicateData: CreateCollectionData = {
            name: newName || `${originalCollection.name} (Copy)`,
            slug: undefined, // Will be auto-generated
            description: originalCollection.description,
            workspaceId: originalCollection.workspaceId,
            icon: originalCollection.icon,
            color: originalCollection.color,
            fields: originalCollection.fields
                ? [...originalCollection.fields]
                : undefined
        };

        return await this.create(duplicateData);
    }
}
