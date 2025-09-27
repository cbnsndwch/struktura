// Schema/Collection core interfaces and types

export enum FieldType {
    // Basic Types
    TEXT = 'text',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    DATE = 'date',
    DATETIME = 'datetime',

    // Rich Types
    EMAIL = 'email',
    URL = 'url',
    PHONE = 'phone',
    CURRENCY = 'currency',
    PERCENT = 'percent',

    // Selection Types
    SELECT = 'select',
    MULTISELECT = 'multiselect',

    // File Types
    ATTACHMENT = 'attachment',
    IMAGE = 'image',

    // Relationship Types
    REFERENCE = 'reference',
    LOOKUP = 'lookup',
    ROLLUP = 'rollup',

    // Advanced Types
    JSON = 'json',
    ARRAY = 'array',
    OBJECT = 'object',

    // Computed Types
    FORMULA = 'formula',
    AUTO_INCREMENT = 'autoIncrement',
    CREATED_TIME = 'createdTime',
    MODIFIED_TIME = 'modifiedTime',
    CREATED_BY = 'createdBy',
    MODIFIED_BY = 'modifiedBy'
}

export interface ValidationRule {
    type:
        | 'required'
        | 'minLength'
        | 'maxLength'
        | 'pattern'
        | 'min'
        | 'max'
        | 'email'
        | 'url'
        | 'custom';
    value?: unknown;
    message: string;
}

export interface FieldOptions {
    options?: Array<{
        value: string;
        label: string;
        color?: string;
    }>;
    precision?: number;
    linkedCollection?: string;
    linkedField?: string;
    formula?: string;
    allowedFileTypes?: string[];
    maxFileSize?: number;
    itemType?: FieldType;
    displayFormat?: string;
    helpText?: string;
    placeholder?: string;
}

export interface Field {
    id: string;
    name: string;
    type: FieldType;
    description?: string;
    required?: boolean;
    unique?: boolean;
    validation?: ValidationRule[];
    options?: FieldOptions;
    order: number;
}

export interface Collection {
    id: string;
    name: string;
    description?: string;
    workspaceId: string;
    slug: string;
    fields: Field[];
    settings: CollectionSettings;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}

export interface CollectionSettings {
    allowComments?: boolean;
    allowAttachments?: boolean;
    enableRevisions?: boolean;
    enableApi?: boolean;
    publicRead?: boolean;
    publicWrite?: boolean;
    webhooks?: WebhookConfig[];
    indexing?: IndexConfig[];
}

export interface WebhookConfig {
    id: string;
    name: string;
    url: string;
    events: WebhookEvent[];
    headers?: Record<string, string>;
    active: boolean;
}

export enum WebhookEvent {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete'
}

export interface IndexConfig {
    fields: string[];
    unique?: boolean;
    sparse?: boolean;
    name?: string;
}

export interface CollectionRecord {
    id: string;
    collectionId: string;
    data: { [key: string]: unknown };
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    modifiedBy?: string;
    version: number;
}

// DTOs
export interface CreateCollectionData {
    name: string;
    description?: string;
    workspaceId: string;
    fields?: Field[];
    settings?: Partial<CollectionSettings>;
}

export interface UpdateCollectionData {
    name?: string;
    description?: string;
    fields?: Field[];
    settings?: Partial<CollectionSettings>;
}

export interface CreateFieldData {
    name: string;
    type: FieldType;
    description?: string;
    required?: boolean;
    unique?: boolean;
    validation?: ValidationRule[];
    options?: FieldOptions;
}

export interface UpdateFieldData {
    name?: string;
    description?: string;
    required?: boolean;
    unique?: boolean;
    validation?: ValidationRule[];
    options?: FieldOptions;
    order?: number;
}

export interface CreateRecordData {
    data: { [key: string]: unknown };
}

export interface UpdateRecordData {
    data: Partial<{ [key: string]: unknown }>;
}

export interface QueryOptions {
    filter?: { [key: string]: unknown };
    sort?: { [key: string]: 1 | -1 };
    limit?: number;
    skip?: number;
    select?: string[];
}

// Service contracts
export interface CollectionServiceContract {
    create(data: CreateCollectionData, userId: string): Promise<Collection>;
    findById(id: string): Promise<Collection | null>;
    findBySlug(workspaceId: string, slug: string): Promise<Collection | null>;
    findByWorkspace(workspaceId: string): Promise<Collection[]>;
    update(id: string, data: UpdateCollectionData): Promise<Collection>;
    delete(id: string): Promise<void>;
    
    // Field management
    addField(collectionId: string, data: CreateFieldData): Promise<Collection>;
    updateField(collectionId: string, fieldId: string, data: UpdateFieldData): Promise<Collection>;
    removeField(collectionId: string, fieldId: string): Promise<Collection>;
    reorderFields(collectionId: string, fieldOrders: Array<{ id: string; order: number }>): Promise<Collection>;
}

export interface RecordServiceContract {
    create(
        collectionId: string,
        data: CreateRecordData,
        userId: string
    ): Promise<CollectionRecord>;
    findById(collectionId: string, id: string): Promise<CollectionRecord | null>;
    findMany(collectionId: string, options?: QueryOptions): Promise<CollectionRecord[]>;
    count(
        collectionId: string,
        filter?: { [key: string]: unknown }
    ): Promise<number>;
    update(
        collectionId: string,
        id: string,
        data: UpdateRecordData,
        userId: string
    ): Promise<CollectionRecord>;
    delete(collectionId: string, id: string): Promise<void>;
    bulkCreate(
        collectionId: string,
        records: CreateRecordData[],
        userId: string
    ): Promise<CollectionRecord[]>;
    bulkUpdate(
        collectionId: string,
        updates: Array<{ id: string; data: UpdateRecordData }>,
        userId: string
    ): Promise<CollectionRecord[]>;
    bulkDelete(collectionId: string, ids: string[]): Promise<void>;
}

export interface CollectionRepositoryContract {
    findById(id: string): Promise<Collection | null>;
    findBySlug(workspaceId: string, slug: string): Promise<Collection | null>;
    findByWorkspaceId(workspaceId: string): Promise<Collection[]>;
    create(collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>): Promise<Collection>;
    update(id: string, updates: Partial<Collection>): Promise<Collection>;
    delete(id: string): Promise<void>;
}

export interface RecordRepositoryContract {
    findById(
        collectionId: string,
        id: string
    ): Promise<CollectionRecord | null>;
    findMany(
        collectionId: string,
        options?: QueryOptions
    ): Promise<CollectionRecord[]>;
    count(
        collectionId: string,
        filter?: { [key: string]: unknown }
    ): Promise<number>;
    create(
        record: Omit<
            CollectionRecord,
            'id' | 'createdAt' | 'updatedAt' | 'version'
        >
    ): Promise<CollectionRecord>;
    update(
        collectionId: string,
        id: string,
        updates: Partial<CollectionRecord>
    ): Promise<CollectionRecord>;
    delete(collectionId: string, id: string): Promise<void>;
    bulkCreate(
        records: Array<
            Omit<CollectionRecord, 'id' | 'createdAt' | 'updatedAt' | 'version'>
        >
    ): Promise<CollectionRecord[]>;
    bulkUpdate(
        collectionId: string,
        updates: Array<{ id: string; data: Partial<CollectionRecord> }>
    ): Promise<CollectionRecord[]>;
    bulkDelete(collectionId: string, ids: string[]): Promise<void>;
}

// Events
export interface CollectionEvent {
    type:
        | 'CREATED'
        | 'UPDATED'
        | 'DELETED'
        | 'FIELD_ADDED'
        | 'FIELD_UPDATED'
        | 'FIELD_REMOVED';
    collectionId: string;
    userId: string;
    timestamp: Date;
    metadata?: { [key: string]: unknown };
}

export interface RecordEvent {
    type: 'CREATED' | 'UPDATED' | 'DELETED';
    collectionId: string;
    recordId: string;
    userId: string;
    timestamp: Date;
    data?: { [key: string]: unknown };
    previousData?: { [key: string]: unknown };
}

// Errors
export class CollectionNotFoundError extends Error {
    constructor(identifier: string) {
        super(`Collection not found: ${identifier}`);
        this.name = 'CollectionNotFoundError';
    }
}

export class RecordNotFoundError extends Error {
    constructor(collectionId: string, recordId: string) {
        super(`Record not found: ${recordId} in collection ${collectionId}`);
        this.name = 'RecordNotFoundError';
    }
}

export class FieldValidationError extends Error {
    constructor(fieldId: string, message: string) {
        super(`Field validation error for ${fieldId}: ${message}`);
        this.name = 'FieldValidationError';
    }
}

export class CollectionSlugConflictError extends Error {
    constructor(slug: string, workspaceId: string) {
        super(
            `Collection slug already exists: ${slug} in workspace ${workspaceId}`
        );
        this.name = 'CollectionSlugConflictError';
    }
}

export class InvalidQueryError extends Error {
    constructor(message: string) {
        super(`Invalid query: ${message}`);
        this.name = 'InvalidQueryError';
    }
}