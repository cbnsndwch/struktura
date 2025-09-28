// Collections domain interfaces and contracts

// Import from shared schema contracts
import { FieldType } from '@cbnsndwch/struktura-schema-contracts';
export { FieldType };

export interface Collection {
    id: string;
    name: string;
    slug: string;
    description?: string;
    workspaceId: string;
    icon?: string;
    color?: string;
    fields: FieldDefinition[];
    views: ViewDefinition[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface FieldDefinition {
    name: string;
    type: FieldType;
    description?: string;
    required: boolean;
    defaultValue?: string;
    options?: FieldOptions;
    validations: FieldValidationRule[];
}

export interface ViewDefinition {
    name: string;
    type: 'table' | 'grid' | 'list' | 'kanban' | 'calendar';
    visibleFields?: string[];
    filters?: string;
    sorting?: string;
    grouping?: string;
}

export interface FieldOptions {
    // Select/Multiselect options
    choices?: Array<{ label: string; value: string; color?: string }>;

    // Reference field options
    referencedCollection?: string;

    // Number field options
    min?: number;
    max?: number;
    precision?: number;

    // Text field options
    minLength?: number;
    maxLength?: number;

    // File/attachment options
    allowedTypes?: string[];
    maxSize?: number;
}

export interface FieldValidationRule {
    type: 'required' | 'unique' | 'min' | 'max' | 'pattern' | 'custom';
    value?: string;
    message?: string;
}

// Collection Template for predefined schemas
export interface CollectionTemplate {
    id: string;
    name: string;
    description: string;
    fields: FieldDefinition[];
    category?: string;
    icon?: string;
}

// Service contracts
export interface CollectionServiceContract {
    // CRUD operations
    create(data: CreateCollectionData, userId: string): Promise<Collection>;
    findById(id: string): Promise<Collection | null>;
    findBySlug(workspaceId: string, slug: string): Promise<Collection | null>;
    findByWorkspace(workspaceId: string): Promise<Collection[]>;
    update(
        id: string,
        data: UpdateCollectionData,
        userId: string
    ): Promise<Collection>;
    delete(id: string, userId: string): Promise<void>;

    // Field operations
    addField(
        collectionId: string,
        field: FieldDefinition,
        userId: string
    ): Promise<Collection>;
    updateField(
        collectionId: string,
        fieldName: string,
        updates: Partial<FieldDefinition>,
        userId: string
    ): Promise<Collection>;
    deleteField(
        collectionId: string,
        fieldName: string,
        userId: string
    ): Promise<Collection>;

    // Template operations
    getTemplates(): Promise<CollectionTemplate[]>;
}

export interface CollectionRepositoryContract {
    findById(id: string): Promise<Collection | null>;
    findBySlug(workspaceId: string, slug: string): Promise<Collection | null>;
    findByWorkspaceId(workspaceId: string): Promise<Collection[]>;
    create(
        collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Collection>;
    update(id: string, updates: Partial<Collection>): Promise<Collection>;
    delete(id: string): Promise<void>;
}

// Data types for operations
export interface CreateCollectionData {
    name: string;
    slug?: string;
    description?: string;
    workspaceId: string;
    icon?: string;
    color?: string;
    fields?: FieldDefinition[];
}

export interface UpdateCollectionData {
    name?: string;
    slug?: string;
    description?: string;
    icon?: string;
    color?: string;
    fields?: FieldDefinition[];
    views?: ViewDefinition[];
    isActive?: boolean;
}

export interface AddFieldData {
    name: string;
    type: FieldType;
    description?: string;
    required?: boolean;
    defaultValue?: string;
    options?: FieldOptions;
    validations?: FieldValidationRule[];
}

export interface UpdateFieldData {
    name?: string;
    type?: FieldType;
    description?: string;
    required?: boolean;
    defaultValue?: string;
    options?: FieldOptions;
    validations?: FieldValidationRule[];
}

// Events
export interface CollectionEvent {
    type:
        | 'CREATED'
        | 'UPDATED'
        | 'DELETED'
        | 'FIELD_ADDED'
        | 'FIELD_UPDATED'
        | 'FIELD_DELETED'
        | 'VIEW_ADDED'
        | 'VIEW_UPDATED'
        | 'VIEW_DELETED';
    collectionId: string;
    workspaceId: string;
    userId: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

// Errors
export class CollectionNotFoundError extends Error {
    constructor(identifier: string) {
        super(`Collection not found: ${identifier}`);
        this.name = 'CollectionNotFoundError';
    }
}

export class CollectionSlugConflictError extends Error {
    constructor(slug: string, workspaceId: string) {
        super(
            `Collection slug '${slug}' already exists in workspace ${workspaceId}`
        );
        this.name = 'CollectionSlugConflictError';
    }
}

export class FieldNotFoundError extends Error {
    constructor(fieldName: string, collectionId: string) {
        super(`Field '${fieldName}' not found in collection ${collectionId}`);
        this.name = 'FieldNotFoundError';
    }
}

export class FieldNameConflictError extends Error {
    constructor(fieldName: string, collectionId: string) {
        super(
            `Field name '${fieldName}' already exists in collection ${collectionId}`
        );
        this.name = 'FieldNameConflictError';
    }
}

export class DuplicateFieldError extends Error {
    constructor(fieldName: string) {
        super(`Field "${fieldName}" already exists`);
        this.name = 'DuplicateFieldError';
    }
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}
