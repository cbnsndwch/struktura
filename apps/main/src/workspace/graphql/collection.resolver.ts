import {
    Resolver,
    Query,
    Mutation,
    Args,
    ID,
    Context,
    Subscription
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

import {
    ObjectType,
    Field as GQLField,
    InputType,
    registerEnumType
} from '@nestjs/graphql';

import { CollectionService } from '../services/collection.service.js';
import {
    CreateCollectionDto,
    UpdateCollectionDto,
    FieldDto,
    CollectionTemplateDto
} from '../dto/collection.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import {
    Collection,
    Field,
    FieldType as SchemaFieldType,
    ValidationRule,
    CollectionDocument
} from '../schemas/collection.schema.js';
import type { FieldOptions } from '../schemas/collection.schema.js';

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

    @GQLField({ nullable: true })
    value?: any;

    @GQLField()
    message!: string;
}

@ObjectType()
class FieldOptionsType {
    @GQLField(() => [String], { nullable: true })
    options?: Array<{
        value: string;
        label: string;
        color?: string;
    }>;

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

    @GQLField(() => [ValidationRuleType])
    validation!: ValidationRule[];

    @GQLField(() => FieldOptionsType)
    options!: FieldOptions;

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
    workspace!: any;

    @GQLField(() => ID)
    createdBy!: any;

    @GQLField(() => [FieldGQLType])
    fields!: Field[];

    @GQLField()
    status!: 'draft' | 'active' | 'archived';

    @GQLField()
    settings!: any;

    @GQLField()
    createdAt!: Date;

    @GQLField()
    updatedAt!: Date;
}

@ObjectType()
class CollectionTemplateType implements CollectionTemplateDto {
    @GQLField()
    id!: string;

    @GQLField()
    name!: string;

    @GQLField()
    description!: string;

    @GQLField(() => [FieldInput])
    fields!: FieldInput[];

    @GQLField({ nullable: true })
    category?: string;

    @GQLField({ nullable: true })
    icon?: string;
}

// Input Types
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
    private pubSub = new PubSub();

    constructor(private readonly collectionService: CollectionService) {}

    // Queries
    @Query(() => [CollectionType])
    async collections(
        @Args('workspaceId', { type: () => ID }) workspaceId: string
    ): Promise<CollectionType[]> {
        return this.collectionService.findByWorkspace(workspaceId) as any;
    }

    @Query(() => CollectionType)
    async collection(
        @Args('workspaceId', { type: () => ID }) workspaceId: string,
        @Args('slug') slug: string
    ): Promise<CollectionType> {
        return this.collectionService.findBySlug(workspaceId, slug) as any;
    }

    @Query(() => [CollectionTemplateType])
    async collectionTemplates(): Promise<CollectionTemplateType[]> {
        return this.collectionService.getTemplates() as any;
    }

    // Mutations
    @Mutation(() => CollectionType)
    async createCollection(
        @Args('input') input: CreateCollectionInput,
        @Context() context: any
    ): Promise<CollectionType> {
        const collection = await this.collectionService.create(
            input as CreateCollectionDto,
            context.req.user.id
        );

        // Publish real-time update
        this.pubSub.publish('collectionCreated', {
            collectionCreated: collection,
            workspaceId: input.workspace
        });

        return collection as any;
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
        const updatedCollection = await this.collectionService.update(
            (collection as any)._id.toString(),
            input as UpdateCollectionDto
        );

        // Publish real-time update
        this.pubSub.publish('collectionUpdated', {
            collectionUpdated: updatedCollection,
            workspaceId: workspaceId
        });

        return updatedCollection as any;
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
        await this.collectionService.delete((collection as any)._id.toString());

        // Publish real-time update
        this.pubSub.publish('collectionDeleted', {
            collectionDeleted: { id: (collection as any)._id.toString(), slug },
            workspaceId: workspaceId
        });

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
        const updatedCollection = await this.collectionService.addField(
            (collection as any)._id.toString(),
            field as any
        );

        // Publish real-time update
        this.pubSub.publish('collectionFieldAdded', {
            collectionFieldAdded: { collection: updatedCollection, field },
            workspaceId: workspaceId
        });

        return updatedCollection as any;
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
        const updatedCollection = await this.collectionService.updateField(
            (collection as any)._id.toString(),
            fieldId,
            field as any
        );

        // Publish real-time update
        this.pubSub.publish('collectionFieldUpdated', {
            collectionFieldUpdated: {
                collection: updatedCollection,
                fieldId,
                field
            },
            workspaceId: workspaceId
        });

        return updatedCollection as any;
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
        const updatedCollection = await this.collectionService.removeField(
            (collection as any)._id.toString(),
            fieldId
        );

        // Publish real-time update
        this.pubSub.publish('collectionFieldRemoved', {
            collectionFieldRemoved: { collection: updatedCollection, fieldId },
            workspaceId: workspaceId
        });

        return updatedCollection as any;
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
        const updatedCollection = await this.collectionService.reorderFields(
            (collection as any)._id.toString(),
            fieldOrder
        );

        // Publish real-time update
        this.pubSub.publish('collectionFieldsReordered', {
            collectionFieldsReordered: {
                collection: updatedCollection,
                fieldOrder
            },
            workspaceId: workspaceId
        });

        return updatedCollection as any;
    }

    // Subscriptions for real-time updates
    @Subscription(() => CollectionType, {
        filter: (payload, variables) => {
            return payload.workspaceId === variables.workspaceId;
        }
    })
    collectionCreated(
        @Args('workspaceId', { type: () => ID }) workspaceId: string
    ) {
        return this.pubSub.asyncIterableIterator('collectionCreated');
    }

    @Subscription(() => CollectionType, {
        filter: (payload, variables) => {
            return payload.workspaceId === variables.workspaceId;
        }
    })
    collectionUpdated(
        @Args('workspaceId', { type: () => ID }) workspaceId: string
    ) {
        return this.pubSub.asyncIterableIterator('collectionUpdated');
    }

    @Subscription(() => String, {
        filter: (payload, variables) => {
            return payload.workspaceId === variables.workspaceId;
        }
    })
    collectionDeleted(
        @Args('workspaceId', { type: () => ID }) workspaceId: string
    ) {
        return this.pubSub.asyncIterableIterator('collectionDeleted');
    }

    @Subscription(() => CollectionType, {
        filter: (payload, variables) => {
            return payload.workspaceId === variables.workspaceId;
        }
    })
    collectionFieldAdded(
        @Args('workspaceId', { type: () => ID }) workspaceId: string
    ) {
        return this.pubSub.asyncIterableIterator('collectionFieldAdded');
    }

    @Subscription(() => CollectionType, {
        filter: (payload, variables) => {
            return payload.workspaceId === variables.workspaceId;
        }
    })
    collectionFieldUpdated(
        @Args('workspaceId', { type: () => ID }) workspaceId: string
    ) {
        return this.pubSub.asyncIterableIterator('collectionFieldUpdated');
    }

    @Subscription(() => CollectionType, {
        filter: (payload, variables) => {
            return payload.workspaceId === variables.workspaceId;
        }
    })
    collectionFieldRemoved(
        @Args('workspaceId', { type: () => ID }) workspaceId: string
    ) {
        return this.pubSub.asyncIterableIterator('collectionFieldRemoved');
    }

    @Subscription(() => CollectionType, {
        filter: (payload, variables) => {
            return payload.workspaceId === variables.workspaceId;
        }
    })
    collectionFieldsReordered(
        @Args('workspaceId', { type: () => ID }) workspaceId: string
    ) {
        return this.pubSub.asyncIterableIterator('collectionFieldsReordered');
    }
}
