import { UseGuards } from '@nestjs/common';
import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
    Field as GQLField,
    InputType,
    ObjectType,
    registerEnumType
} from '@nestjs/graphql';
import { Types } from 'mongoose';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import {
    CollectionTemplateDto,
    CreateCollectionDto,
    FieldDto,
    UpdateCollectionDto
} from '../dto/collection.dto.js';
import type { FieldOptions } from '../schemas/collection.schema.js';
import {
    CollectionDocument,
    FieldType as SchemaFieldType,
    ValidationRule
} from '../schemas/collection.schema.js';
import { CollectionService } from '../services/collection.service.js';

// GraphQL Types

// Register enum for GraphQL
registerEnumType(SchemaFieldType, {
    name: 'FieldType',
    description: 'Available field types for collection schema'
});

@ObjectType()
class ValidationRuleType {
    @GQLField()
    type!:
        | 'required'
        | 'minLength'
        | 'maxLength'
        | 'pattern'
        | 'min'
        | 'max'
        | 'email'
        | 'url'
        | 'custom';

    @GQLField(() => String, { nullable: true })
    value?: string;

    @GQLField()
    message!: string;
}

@ObjectType()
class FieldOptionType {
    @GQLField()
    value!: string;

    @GQLField()
    label!: string;

    @GQLField({ nullable: true })
    color?: string;
}

@ObjectType()
class FieldOptionsType {
    @GQLField(() => [FieldOptionType], { nullable: true })
    options?: FieldOptionType[];

    @GQLField({ nullable: true })
    precision?: number;

    @GQLField({ nullable: true })
    linkedCollection?: string;

    @GQLField({ nullable: true })
    linkedField?: string;

    @GQLField({ nullable: true })
    formula?: string;

    @GQLField(() => [String], { nullable: true })
    allowedFileTypes?: string[];

    @GQLField({ nullable: true })
    maxFileSize?: number;

    @GQLField(() => SchemaFieldType, { nullable: true })
    itemType?: SchemaFieldType;

    @GQLField({ nullable: true })
    displayFormat?: string;

    @GQLField({ nullable: true })
    helpText?: string;

    @GQLField({ nullable: true })
    placeholder?: string;
}

@ObjectType()
class FieldGQLType {
    @GQLField()
    id!: string;

    @GQLField()
    name!: string;

    @GQLField(() => SchemaFieldType)
    type!: SchemaFieldType;

    @GQLField({ nullable: true })
    description?: string;

    @GQLField()
    required!: boolean;

    @GQLField()
    unique!: boolean;

    @GQLField(() => [ValidationRuleType], { nullable: true })
    validation?: ValidationRule[];

    @GQLField(() => FieldOptionsType, { nullable: true })
    options?: FieldOptions;

    @GQLField()
    order!: number;
}

@ObjectType()
class CollectionType {
    @GQLField(() => ID)
    _id!: string;

    @GQLField()
    name!: string;

    @GQLField()
    slug!: string;

    @GQLField({ nullable: true })
    description?: string;

    @GQLField(() => ID)
    workspace!: string;

    @GQLField(() => ID)
    createdBy!: string;

    @GQLField(() => [FieldGQLType])
    fields!: FieldGQLType[];

    @GQLField()
    status!: 'draft' | 'active' | 'archived';

    @GQLField(() => String)
    settings!: string;

    @GQLField()
    createdAt!: Date;

    @GQLField()
    updatedAt!: Date;
}

// Mapper function to convert CollectionDocument to CollectionType
function mapCollectionDocumentToType(
    document: CollectionDocument
): CollectionType {
    return {
        _id: (document._id as Types.ObjectId).toString(),
        name: document.name,
        slug: document.slug,
        description: document.description,
        workspace: (document.workspace as Types.ObjectId).toString(),
        createdBy: (document.createdBy as Types.ObjectId).toString(),
        fields:
            document.fields?.map(field => ({
                id: field.id,
                name: field.name,
                type: field.type,
                description: field.description,
                required: field.required,
                unique: field.unique,
                order: field.order,
                options: {
                    options: field.options.options,
                    precision: field.options.precision,
                    linkedCollection: field.options.linkedCollection,
                    linkedField: field.options.linkedField,
                    formula: field.options.formula,
                    allowedFileTypes: field.options.allowedFileTypes,
                    maxFileSize: field.options.maxFileSize,
                    itemType: field.options.itemType,
                    displayFormat: field.options.displayFormat,
                    helpText: field.options.helpText,
                    placeholder: field.options.placeholder
                },
                validationRules:
                    field.validation?.map(rule => ({
                        type: rule.type,
                        value: rule.value,
                        message: rule.message
                    })) || []
            })) || [],
        status: document.status,
        settings: JSON.stringify(document.settings),
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
    };
}

// Input Types
@InputType()
class FieldInput {
    @GQLField()
    id!: string;

    @GQLField()
    name!: string;

    @GQLField(() => SchemaFieldType)
    type!: SchemaFieldType;

    @GQLField({ nullable: true })
    description?: string;

    @GQLField({ defaultValue: false })
    required!: boolean;

    @GQLField({ defaultValue: false })
    unique!: boolean;

    @GQLField()
    order!: number;
}

@ObjectType()
class TemplateFieldType {
    @GQLField()
    id!: string;

    @GQLField()
    name!: string;

    @GQLField(() => SchemaFieldType)
    type!: SchemaFieldType;

    @GQLField({ nullable: true })
    description?: string;

    @GQLField()
    required!: boolean;

    @GQLField()
    unique!: boolean;

    @GQLField()
    order!: number;
}

@ObjectType()
class CollectionTemplateType {
    @GQLField()
    id!: string;

    @GQLField()
    name!: string;

    @GQLField()
    description!: string;

    @GQLField(() => [TemplateFieldType])
    fields!: TemplateFieldType[];

    @GQLField({ nullable: true })
    category?: string;

    @GQLField({ nullable: true })
    icon?: string;
}

// Mapper function to convert CollectionTemplateDto to CollectionTemplateType
function mapCollectionTemplateToType(
    template: CollectionTemplateDto
): CollectionTemplateType {
    return {
        id: template.id,
        name: template.name,
        description: template.description,
        fields: template.fields.map(field => ({
            id: field.id || '',
            name: field.name,
            type: field.type,
            description: field.description,
            required: field.required || false,
            unique: field.unique || false,
            order: field.order || 0
        })) as TemplateFieldType[],
        category: template.category,
        icon: template.icon
    };
}

@InputType()
class CreateCollectionInput {
    @GQLField()
    name!: string;

    @GQLField({ nullable: true })
    description?: string;

    @GQLField({ nullable: true })
    slug?: string;

    @GQLField(() => ID)
    workspace!: string;

    @GQLField(() => [FieldInput], { nullable: true })
    fields?: FieldInput[];

    @GQLField({ nullable: true })
    status?: string;
}

@InputType()
class UpdateCollectionInput {
    @GQLField({ nullable: true })
    name?: string;

    @GQLField({ nullable: true })
    description?: string;

    @GQLField(() => [FieldInput], { nullable: true })
    fields?: FieldInput[];

    @GQLField({ nullable: true })
    status?: string;
}

@Resolver(() => CollectionType)
@UseGuards(JwtAuthGuard)
export class CollectionResolver {
    constructor(private readonly collectionService: CollectionService) {}

    // Queries
    @Query(() => [CollectionType])
    async collections(
        @Args('workspaceId', { type: () => ID }) workspaceId: string
    ): Promise<CollectionType[]> {
        const documents =
            await this.collectionService.findByWorkspace(workspaceId);
        return documents.map(doc => mapCollectionDocumentToType(doc));
    }

    @Query(() => CollectionType)
    async collection(
        @Args('workspaceId', { type: () => ID }) workspaceId: string,
        @Args('slug') slug: string
    ): Promise<CollectionType> {
        const document = await this.collectionService.findBySlug(
            workspaceId,
            slug
        );
        return mapCollectionDocumentToType(document);
    }

    @Query(() => [CollectionTemplateType])
    async collectionTemplates(): Promise<CollectionTemplateType[]> {
        const templates = await this.collectionService.getTemplates();
        return templates.map(template => mapCollectionTemplateToType(template));
    }

    // Mutations
    @Mutation(() => CollectionType)
    async createCollection(
        @Args('input') input: CreateCollectionInput,
        @Context() context: { req: { user: { id: string } } }
    ): Promise<CollectionType> {
        const document = await this.collectionService.create(
            input as CreateCollectionDto,
            context.req.user.id
        );

        const collectionType = mapCollectionDocumentToType(document);

        return collectionType;
    }

    @Mutation(() => CollectionType)
    async updateCollection(
        @Args('workspaceId', { type: () => ID }) workspaceId: string,
        @Args('slug') slug: string,
        @Args('input') input: UpdateCollectionInput
    ): Promise<CollectionType> {
        const collection = await this.collectionService.findBySlug(
            workspaceId,
            slug
        );
        const updatedDocument = await this.collectionService.update(
            (collection._id as Types.ObjectId).toString(),
            input as UpdateCollectionDto
        );

        const updatedCollectionType =
            mapCollectionDocumentToType(updatedDocument);

        return updatedCollectionType;
    }

    @Mutation(() => Boolean)
    async deleteCollection(
        @Args('workspaceId', { type: () => ID }) workspaceId: string,
        @Args('slug') slug: string
    ): Promise<boolean> {
        const collection = await this.collectionService.findBySlug(
            workspaceId,
            slug
        );
        const collectionId = (collection._id as Types.ObjectId).toString();
        await this.collectionService.delete(collectionId);

        return true;
    }

    @Mutation(() => CollectionType)
    async addFieldToCollection(
        @Args('workspaceId', { type: () => ID }) workspaceId: string,
        @Args('slug') slug: string,
        @Args('field') field: FieldInput
    ): Promise<CollectionType> {
        const collection = await this.collectionService.findBySlug(
            workspaceId,
            slug
        );
        const updatedDocument = await this.collectionService.addField(
            (collection._id as Types.ObjectId).toString(),
            field as FieldDto
        );

        const updatedCollectionType =
            mapCollectionDocumentToType(updatedDocument);

        return updatedCollectionType;
    }

    @Mutation(() => CollectionType)
    async updateCollectionField(
        @Args('workspaceId', { type: () => ID }) workspaceId: string,
        @Args('slug') slug: string,
        @Args('fieldId') fieldId: string,
        @Args('field') field: FieldInput
    ): Promise<CollectionType> {
        const collection = await this.collectionService.findBySlug(
            workspaceId,
            slug
        );
        const updatedDocument = await this.collectionService.updateField(
            (collection._id as Types.ObjectId).toString(),
            fieldId,
            field as Partial<FieldDto>
        );

        const updatedCollectionType =
            mapCollectionDocumentToType(updatedDocument);

        return updatedCollectionType;
    }

    @Mutation(() => CollectionType)
    async removeCollectionField(
        @Args('workspaceId', { type: () => ID }) workspaceId: string,
        @Args('slug') slug: string,
        @Args('fieldId') fieldId: string
    ): Promise<CollectionType> {
        const collection = await this.collectionService.findBySlug(
            workspaceId,
            slug
        );
        const updatedDocument = await this.collectionService.removeField(
            (collection._id as Types.ObjectId).toString(),
            fieldId
        );

        const updatedCollectionType =
            mapCollectionDocumentToType(updatedDocument);

        return updatedCollectionType;
    }

    @Mutation(() => CollectionType)
    async reorderCollectionFields(
        @Args('workspaceId', { type: () => ID }) workspaceId: string,
        @Args('slug') slug: string,
        @Args('fieldOrder', { type: () => [String] }) fieldOrder: string[]
    ): Promise<CollectionType> {
        const collection = await this.collectionService.findBySlug(
            workspaceId,
            slug
        );
        const updatedDocument = await this.collectionService.reorderFields(
            (collection._id as Types.ObjectId).toString(),
            fieldOrder
        );

        const updatedCollectionType =
            mapCollectionDocumentToType(updatedDocument);

        return updatedCollectionType;
    }
}
