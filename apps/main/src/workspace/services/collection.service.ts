import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Collection, CollectionDocument, Field, FieldType } from '../schemas/collection.schema.js';
import { CreateCollectionDto, UpdateCollectionDto, CollectionTemplateDto } from '../dto/collection.dto.js';

@Injectable()
export class CollectionService {
    constructor(
        @InjectModel(Collection.name)
        private readonly collectionModel: Model<CollectionDocument>
    ) {}

    // Create a new collection
    async create(createCollectionDto: CreateCollectionDto, userId: string): Promise<CollectionDocument> {
        // Generate slug if not provided
        if (!createCollectionDto.slug) {
            createCollectionDto.slug = this.generateSlug(createCollectionDto.name);
        }

        // Check if slug is unique within the workspace
        const existingCollection = await this.collectionModel.findOne({
            workspace: new Types.ObjectId(createCollectionDto.workspace),
            slug: createCollectionDto.slug
        });

        if (existingCollection) {
            throw new ConflictException(`Collection with slug '${createCollectionDto.slug}' already exists in this workspace`);
        }

        // Validate and process fields
        const processedFields = this.processFields(createCollectionDto.fields || []);

        const collection = new this.collectionModel({
            ...createCollectionDto,
            workspace: new Types.ObjectId(createCollectionDto.workspace),
            createdBy: new Types.ObjectId(userId),
            fields: processedFields
        });

        return collection.save();
    }

    // Find all collections in a workspace
    async findByWorkspace(workspaceId: string): Promise<CollectionDocument[]> {
        return this.collectionModel
            .find({ workspace: new Types.ObjectId(workspaceId) })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .exec();
    }

    // Find collection by ID
    async findById(id: string): Promise<CollectionDocument> {
        const collection = await this.collectionModel
            .findById(id)
            .populate('workspace')
            .populate('createdBy', 'name email')
            .exec();

        if (!collection) {
            throw new NotFoundException(`Collection with ID '${id}' not found`);
        }

        return collection as CollectionDocument;
    }

    // Find collection by workspace and slug
    async findBySlug(workspaceId: string, slug: string): Promise<CollectionDocument> {
        const collection = await this.collectionModel
            .findOne({
                workspace: new Types.ObjectId(workspaceId),
                slug
            })
            .populate('workspace')
            .populate('createdBy', 'name email')
            .exec();

        if (!collection) {
            throw new NotFoundException(`Collection '${slug}' not found in workspace`);
        }

        return collection as CollectionDocument;
    }

    // Update collection
    async update(id: string, updateCollectionDto: UpdateCollectionDto): Promise<CollectionDocument> {
        const collection = await this.findById(id);

        // Process fields if provided
        if (updateCollectionDto.fields) {
            updateCollectionDto.fields = this.processFields(updateCollectionDto.fields);
        }

        Object.assign(collection, updateCollectionDto);
        return collection.save();
    }

    // Delete collection
    async delete(id: string): Promise<void> {
        const result = await this.collectionModel.deleteOne({ _id: id });
        
        if (result.deletedCount === 0) {
            throw new NotFoundException(`Collection with ID '${id}' not found`);
        }
    }

    // Add field to collection
    async addField(collectionId: string, field: Field): Promise<CollectionDocument> {
        const collection = await this.findById(collectionId);
        
        // Check if field ID is unique
        const existingField = collection.fields.find(f => f.id === field.id);
        if (existingField) {
            throw new ConflictException(`Field with ID '${field.id}' already exists`);
        }

        // Validate field
        this.validateField(field);

        // Set order if not provided
        if (field.order === undefined || field.order === null) {
            field.order = collection.fields.length;
        }

        collection.fields.push(field);
        return collection.save();
    }

    // Update field in collection
    async updateField(collectionId: string, fieldId: string, fieldUpdate: Partial<Field>): Promise<CollectionDocument> {
        const collection = await this.findById(collectionId);
        
        const fieldIndex = collection.fields.findIndex(f => f.id === fieldId);
        if (fieldIndex === -1) {
            throw new NotFoundException(`Field with ID '${fieldId}' not found`);
        }

        const field = collection.fields[fieldIndex];
        if (!field) {
            throw new NotFoundException(`Field with ID '${fieldId}' not found`);
        }

        // Merge updates
        Object.assign(field, fieldUpdate);
        
        // Validate updated field
        this.validateField(field);

        return collection.save();
    }

    // Remove field from collection
    async removeField(collectionId: string, fieldId: string): Promise<CollectionDocument> {
        const collection = await this.findById(collectionId);
        
        const fieldIndex = collection.fields.findIndex(f => f.id === fieldId);
        if (fieldIndex === -1) {
            throw new NotFoundException(`Field with ID '${fieldId}' not found`);
        }

        collection.fields.splice(fieldIndex, 1);
        return collection.save();
    }

    // Reorder fields
    async reorderFields(collectionId: string, fieldOrder: string[]): Promise<CollectionDocument> {
        const collection = await this.findById(collectionId);
        
        // Validate all field IDs exist
        const fieldIds = collection.fields.map(f => f.id);
        const missingFields = fieldOrder.filter(id => !fieldIds.includes(id));
        if (missingFields.length > 0) {
            throw new BadRequestException(`Fields not found: ${missingFields.join(', ')}`);
        }

        // Reorder fields based on provided order
        const reorderedFields = fieldOrder.map((fieldId, index) => {
            const field = collection.fields.find(f => f.id === fieldId)!;
            field.order = index;
            return field;
        });

        collection.fields = reorderedFields;
        return collection.save();
    }

    // Get collection templates
    async getTemplates(): Promise<CollectionTemplateDto[]> {
        // Predefined templates for common use cases
        return [
            {
                id: 'project-management',
                name: 'Project Management',
                description: 'Track projects with tasks, deadlines, and status',
                category: 'Business',
                icon: 'project',
                fields: [
                    {
                        id: 'name',
                        name: 'Project Name',
                        type: FieldType.TEXT,
                        required: true,
                        order: 0,
                        options: {
                            placeholder: 'Enter project name'
                        }
                    },
                    {
                        id: 'description',
                        name: 'Description',
                        type: FieldType.TEXT,
                        order: 1,
                        options: {
                            placeholder: 'Project description'
                        }
                    },
                    {
                        id: 'status',
                        name: 'Status',
                        type: FieldType.SELECT,
                        required: true,
                        order: 2,
                        options: {
                            options: [
                                { value: 'planning', label: 'Planning', color: '#gray' },
                                { value: 'in-progress', label: 'In Progress', color: '#blue' },
                                { value: 'review', label: 'Review', color: '#yellow' },
                                { value: 'completed', label: 'Completed', color: '#green' },
                                { value: 'cancelled', label: 'Cancelled', color: '#red' }
                            ]
                        }
                    },
                    {
                        id: 'due_date',
                        name: 'Due Date',
                        type: FieldType.DATE,
                        order: 3
                    },
                    {
                        id: 'assignee',
                        name: 'Assignee',
                        type: FieldType.TEXT,
                        order: 4,
                        options: {
                            placeholder: 'Who is responsible?'
                        }
                    }
                ]
            },
            {
                id: 'customer-database',
                name: 'Customer Database',
                description: 'Manage customer information and contacts',
                category: 'CRM',
                icon: 'users',
                fields: [
                    {
                        id: 'company_name',
                        name: 'Company Name',
                        type: FieldType.TEXT,
                        required: true,
                        order: 0
                    },
                    {
                        id: 'contact_name',
                        name: 'Contact Name',
                        type: FieldType.TEXT,
                        required: true,
                        order: 1
                    },
                    {
                        id: 'email',
                        name: 'Email',
                        type: FieldType.EMAIL,
                        required: true,
                        order: 2
                    },
                    {
                        id: 'phone',
                        name: 'Phone',
                        type: FieldType.PHONE,
                        order: 3
                    },
                    {
                        id: 'website',
                        name: 'Website',
                        type: FieldType.URL,
                        order: 4
                    },
                    {
                        id: 'industry',
                        name: 'Industry',
                        type: FieldType.SELECT,
                        order: 5,
                        options: {
                            options: [
                                { value: 'technology', label: 'Technology' },
                                { value: 'healthcare', label: 'Healthcare' },
                                { value: 'finance', label: 'Finance' },
                                { value: 'retail', label: 'Retail' },
                                { value: 'other', label: 'Other' }
                            ]
                        }
                    }
                ]
            },
            {
                id: 'inventory',
                name: 'Inventory Management',
                description: 'Track products, stock levels, and suppliers',
                category: 'Operations',
                icon: 'package',
                fields: [
                    {
                        id: 'product_name',
                        name: 'Product Name',
                        type: FieldType.TEXT,
                        required: true,
                        order: 0
                    },
                    {
                        id: 'sku',
                        name: 'SKU',
                        type: FieldType.TEXT,
                        required: true,
                        unique: true,
                        order: 1
                    },
                    {
                        id: 'price',
                        name: 'Price',
                        type: FieldType.CURRENCY,
                        required: true,
                        order: 2
                    },
                    {
                        id: 'quantity',
                        name: 'Quantity in Stock',
                        type: FieldType.NUMBER,
                        required: true,
                        order: 3,
                        validation: [
                            { type: 'min', value: 0, message: 'Quantity cannot be negative' }
                        ]
                    },
                    {
                        id: 'supplier',
                        name: 'Supplier',
                        type: FieldType.TEXT,
                        order: 4
                    },
                    {
                        id: 'category',
                        name: 'Category',
                        type: FieldType.SELECT,
                        order: 5,
                        options: {
                            options: [
                                { value: 'electronics', label: 'Electronics' },
                                { value: 'clothing', label: 'Clothing' },
                                { value: 'books', label: 'Books' },
                                { value: 'home', label: 'Home & Garden' },
                                { value: 'other', label: 'Other' }
                            ]
                        }
                    }
                ]
            }
        ];
    }

    // Helper method to generate slug from name
    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    // Helper method to process and validate fields
    private processFields(fields: any[]): Field[] {
        return fields.map((field, index) => {
            // Set order if not provided
            if (field.order === undefined || field.order === null) {
                field.order = index;
            }

            // Generate ID if not provided
            if (!field.id) {
                field.id = this.generateFieldId(field.name);
            }

            this.validateField(field);
            return field;
        });
    }

    // Helper method to generate field ID from name
    private generateFieldId(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .trim();
    }

    // Helper method to validate field
    private validateField(field: Field): void {
        // Validate field type specific requirements
        switch (field.type) {
            case FieldType.SELECT:
            case FieldType.MULTISELECT:
                if (!field.options?.options || field.options.options.length === 0) {
                    throw new BadRequestException(`Field '${field.name}' of type ${field.type} must have options`);
                }
                break;
            case FieldType.REFERENCE:
            case FieldType.LOOKUP:
                if (!field.options?.linkedCollection) {
                    throw new BadRequestException(`Field '${field.name}' of type ${field.type} must specify a linked collection`);
                }
                break;
            case FieldType.FORMULA:
                if (!field.options?.formula) {
                    throw new BadRequestException(`Field '${field.name}' of type ${field.type} must have a formula`);
                }
                break;
        }
    }
}