import {
    Injectable,
    NotFoundException,
    ConflictException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
    Collection,
    CollectionDocument} from '../entities/collections/collection.entity.js';
import { FieldType } from '../entities/collections/field-type.enum.js';
import {
    CreateCollectionDto,
    UpdateCollectionDto,
    CollectionTemplateDto,
    FieldDefinitionDto
} from '../dto/collection.dto.js';

@Injectable()
export class CollectionService {
    constructor(
        @InjectModel(Collection.name)
        private readonly collectionModel: Model<CollectionDocument>
    ) {}

    /**
     * Create a new collection
     */
    async create(
        createCollectionDto: CreateCollectionDto,
        userId: string
    ): Promise<CollectionDocument> {
        // Generate slug if not provided
        if (!createCollectionDto.slug) {
            createCollectionDto.slug = this.generateSlug(
                createCollectionDto.name
            );
        }

        // Check if slug is unique within the workspace
        const existingCollection = await this.collectionModel.findOne({
            workspaceId: new Types.ObjectId(createCollectionDto.workspaceId),
            slug: createCollectionDto.slug
        });

        if (existingCollection) {
            throw new ConflictException(
                `Collection with slug '${createCollectionDto.slug}' already exists in this workspace`
            );
        }

        // Create collection with defaults
        const collection = new this.collectionModel({
            name: createCollectionDto.name,
            slug: createCollectionDto.slug,
            description: createCollectionDto.description,
            workspaceId: new Types.ObjectId(createCollectionDto.workspaceId),
            icon: createCollectionDto.icon,
            color: createCollectionDto.color,
            fields: createCollectionDto.fields || [],
            views: createCollectionDto.views || [],
            defaultView: createCollectionDto.defaultView || 'table',
            isActive: true,
            createdBy: new Types.ObjectId(userId),
            modifiedBy: new Types.ObjectId(userId)
        });

        return collection.save();
    }

    /**
     * Find all collections in a workspace
     */
    async findAllInWorkspace(
        workspaceId: string
    ): Promise<CollectionDocument[]> {
        return this.collectionModel
            .find({
                workspaceId: new Types.ObjectId(workspaceId),
                isActive: true
            })
            .sort({ name: 1 })
            .exec();
    }

    /**
     * Find collection by ID
     */
    async findOne(id: string): Promise<CollectionDocument> {
        const collection = await this.collectionModel.findById(id).exec();

        if (!collection) {
            throw new NotFoundException('Collection not found');
        }

        return collection;
    }

    /**
     * Find collection by slug within workspace
     */
    async findBySlug(
        workspaceId: string,
        slug: string
    ): Promise<CollectionDocument> {
        const collection = await this.collectionModel
            .findOne({
                workspaceId: new Types.ObjectId(workspaceId),
                slug,
                isActive: true
            })
            .exec();

        if (!collection) {
            throw new NotFoundException('Collection not found');
        }

        return collection;
    }

    /**
     * Update collection
     */
    async update(
        id: string,
        updateCollectionDto: UpdateCollectionDto,
        userId: string
    ): Promise<CollectionDocument> {
        const collection = await this.findOne(id);

        // Update fields
        if (updateCollectionDto.name) {
            collection.name = updateCollectionDto.name;
        }

        if (updateCollectionDto.description !== undefined) {
            collection.description = updateCollectionDto.description;
        }

        if (updateCollectionDto.icon !== undefined) {
            collection.icon = updateCollectionDto.icon;
        }

        if (updateCollectionDto.color !== undefined) {
            collection.color = updateCollectionDto.color;
        }

        if (updateCollectionDto.fields) {
            collection.fields = updateCollectionDto.fields.map(field => ({
                ...field,
                validations: field.validations ?? []
            }));
        }

        if (updateCollectionDto.views) {
            collection.views = updateCollectionDto.views;
        }

        if (updateCollectionDto.defaultView) {
            collection.defaultView = updateCollectionDto.defaultView;
        }

        if (updateCollectionDto.isActive !== undefined) {
            collection.isActive = updateCollectionDto.isActive;
        }

        collection.modifiedBy = new Types.ObjectId(userId);

        return collection.save();
    }

    /**
     * Delete collection (soft delete)
     */
    async remove(id: string, userId: string): Promise<void> {
        const collection = await this.findOne(id);

        collection.isActive = false;
        collection.modifiedBy = new Types.ObjectId(userId);

        await collection.save();
    }

    /**
     * Add field to collection
     */
    async addField(
        collectionId: string,
        fieldDto: FieldDefinitionDto,
        userId: string
    ): Promise<CollectionDocument> {
        const collection = await this.findOne(collectionId);

        // Check if field name already exists
        const existingField = collection.fields.find(
            field => field.name === fieldDto.name
        );

        if (existingField) {
            throw new ConflictException(
                `Field with name '${fieldDto.name}' already exists`
            );
        }

        // Add the new field
        collection.fields.push({
            ...fieldDto,
            validations: fieldDto.validations ?? []
        });
        collection.modifiedBy = new Types.ObjectId(userId);

        return collection.save();
    }

    /**
     * Update field in collection
     */
    async updateField(
        collectionId: string,
        fieldName: string,
        fieldDto: FieldDefinitionDto,
        userId: string
    ): Promise<CollectionDocument> {
        const collection = await this.findOne(collectionId);

        const fieldIndex = collection.fields.findIndex(
            field => field.name === fieldName
        );

        if (fieldIndex === -1) {
            throw new NotFoundException('Field not found');
        }

        // Update the field
        collection.fields[fieldIndex] = {
            ...collection.fields[fieldIndex],
            ...fieldDto,
            validations: fieldDto.validations ?? []
        };

        collection.modifiedBy = new Types.ObjectId(userId);

        return collection.save();
    }

    /**
     * Remove field from collection
     */
    async removeField(
        collectionId: string,
        fieldName: string,
        userId: string
    ): Promise<CollectionDocument> {
        const collection = await this.findOne(collectionId);

        const fieldIndex = collection.fields.findIndex(
            field => field.name === fieldName
        );

        if (fieldIndex === -1) {
            throw new NotFoundException('Field not found');
        }

        // Remove the field
        collection.fields.splice(fieldIndex, 1);
        collection.modifiedBy = new Types.ObjectId(userId);

        return collection.save();
    }

    /**
     * Get collection templates
     */
    async getTemplates(): Promise<CollectionTemplateDto[]> {
        // Predefined templates for common use cases
        return [
            {
                id: 'project-management',
                name: 'Project Management',
                description: 'Track projects with tasks, status, and deadlines',
                category: 'Business',
                icon: '📋',
                fields: [
                    {
                        name: 'title',
                        label: 'Title',
                        type: FieldType.TEXT,
                        required: true,
                        unique: false,
                        order: 1
                    },
                    {
                        name: 'description',
                        label: 'Description',
                        type: FieldType.TEXT,
                        required: false,
                        unique: false,
                        order: 2
                    },
                    {
                        name: 'status',
                        label: 'Status',
                        type: FieldType.SELECT,
                        required: true,
                        unique: false,
                        order: 3,
                        options: {
                            choices: [
                                'Not Started',
                                'In Progress',
                                'Completed',
                                'On Hold'
                            ]
                        }
                    },
                    {
                        name: 'priority',
                        label: 'Priority',
                        type: FieldType.SELECT,
                        required: false,
                        unique: false,
                        order: 4,
                        options: {
                            choices: ['Low', 'Medium', 'High', 'Critical']
                        }
                    },
                    {
                        name: 'due_date',
                        label: 'Due Date',
                        type: FieldType.DATE,
                        required: false,
                        unique: false,
                        order: 5
                    },
                    {
                        name: 'assignee',
                        label: 'Assignee',
                        type: FieldType.TEXT,
                        required: false,
                        unique: false,
                        order: 6
                    }
                ]
            },
            {
                id: 'contact-management',
                name: 'Contact Management',
                description:
                    'Organize contacts with names, emails, and phone numbers',
                category: 'Business',
                icon: '👥',
                fields: [
                    {
                        name: 'first_name',
                        label: 'First Name',
                        type: FieldType.TEXT,
                        required: true,
                        unique: false,
                        order: 1
                    },
                    {
                        name: 'last_name',
                        label: 'Last Name',
                        type: FieldType.TEXT,
                        required: true,
                        unique: false,
                        order: 2
                    },
                    {
                        name: 'email',
                        label: 'Email',
                        type: FieldType.EMAIL,
                        required: false,
                        unique: true,
                        order: 3
                    },
                    {
                        name: 'phone',
                        label: 'Phone',
                        type: FieldType.PHONE,
                        required: false,
                        unique: false,
                        order: 4
                    },
                    {
                        name: 'company',
                        label: 'Company',
                        type: FieldType.TEXT,
                        required: false,
                        unique: false,
                        order: 5
                    },
                    {
                        name: 'notes',
                        label: 'Notes',
                        type: FieldType.TEXT,
                        required: false,
                        unique: false,
                        order: 6
                    }
                ]
            }
        ];
    }

    /**
     * Generate slug from name
     */
    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}
