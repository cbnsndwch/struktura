/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Inject,
    Injectable,
    Logger,
    OnModuleInit,
    Optional
} from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import type { BetterAuthOptions } from '@better-auth/core';
import type {
    AdapterFactoryCustomizeAdapterCreator,
    AdapterFactoryOptions,
    DBAdapter,
    DBAdapterDebugLogOption,
    DBAdapterInstance,
    Where
} from '@better-auth/core/db/adapter';
import { createAdapterFactory } from '@better-auth/core/db/adapter';
import type { ClientSession, Db, Document } from 'mongodb';
import { ObjectId } from 'mongodb';
import type { Connection } from 'mongoose';

// #region Configuration Types

export interface NestJSMongoDBAdapterConfig {
    /**
     * Enable debug logs for the adapter
     *
     * @default false
     */
    debugLogs?: DBAdapterDebugLogOption | undefined;

    /**
     * Use plural table names
     *
     * @default false
     */
    usePlural?: boolean | undefined;

    /**
     * Whether to execute multiple operations in a transaction.
     *
     * If the database doesn't support transactions,
     * set this to `false` and operations will be executed sequentially.
     * @default false
     */
    transaction?: boolean | undefined;
}

export const NESTJS_MONGODB_ADAPTER_CONFIG = Symbol.for(
    'NESTJS_MONGODB_ADAPTER_CONFIG'
);

// #endregion

// #region Utility Functions

/**
 * Safely escape user input for use in a MongoDB regex.
 * This ensures the resulting pattern is treated as literal text,
 * and not as a regex with special syntax.
 *
 * @param input - The input string to escape. Any type that isn't a string will be converted to an empty string.
 * @param maxLength - The maximum length of the input string to escape. Defaults to 256. This is to prevent DOS attacks.
 * @returns The escaped string.
 */
export function escapeForMongoRegex(input: string, maxLength = 256): string {
    if (typeof input !== 'string') return '';

    // Escape all PCRE special characters
    // Source: PCRE docs — https://www.pcre.org/original/doc/html/pcrepattern.html
    return input.slice(0, maxLength).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get the custom ID generator from Better Auth options if configured
 */
export function getCustomIdGenerator(options: BetterAuthOptions) {
    const generator = options.advanced?.database?.generateId;
    if (typeof generator === 'function') {
        return generator;
    }
    return undefined;
}

/**
 * Schema type used by the adapter
 */
export type AdapterSchema = Record<
    string,
    {
        fields: Record<
            string,
            { references?: { field: string }; unique?: boolean }
        >;
    }
>;

/**
 * Serialize ID values to MongoDB ObjectId format when appropriate
 */
export function serializeID(params: {
    field: string;
    value: any;
    model: string;
    getDefaultModelName: (model: string) => string;
    schema: AdapterSchema;
    customIdGen: ReturnType<typeof getCustomIdGenerator>;
}): any {
    const { field, value, model, getDefaultModelName, schema, customIdGen } =
        params;

    if (customIdGen) {
        return value;
    }

    const normalizedModel = getDefaultModelName(model);

    if (
        field === 'id' ||
        field === '_id' ||
        schema[normalizedModel]?.fields[field]?.references?.field === 'id'
    ) {
        if (value === null || value === undefined) {
            return value;
        }

        if (typeof value !== 'string') {
            if (value instanceof ObjectId) {
                return value;
            }

            if (Array.isArray(value)) {
                return value.map((v: any) => {
                    if (v === null || v === undefined) {
                        return v;
                    }
                    if (typeof v === 'string') {
                        try {
                            return new ObjectId(v);
                        } catch {
                            return v;
                        }
                    }
                    if (v instanceof ObjectId) {
                        return v;
                    }
                    throw new Error(
                        'Invalid id value, received: ' + JSON.stringify(v)
                    );
                });
            }

            throw new Error(
                'Invalid id value, received: ' + JSON.stringify(value)
            );
        }

        try {
            return new ObjectId(value);
        } catch {
            return value;
        }
    }

    return value;
}

/**
 * Build a single MongoDB condition from a Where clause item
 */
export function buildCondition(params: {
    w: Where;
    model: string;
    getFieldName: (params: { model: string; field: string }) => string;
    getDefaultModelName: (model: string) => string;
    schema: AdapterSchema;
    customIdGen: ReturnType<typeof getCustomIdGenerator>;
}): { condition: Record<string, any>; connector: string } {
    const { w, model, getFieldName, getDefaultModelName, schema, customIdGen } =
        params;
    const { field: field_, value, operator = 'eq', connector = 'AND' } = w;

    let field = getFieldName({ model, field: field_ });
    if (field === 'id') field = '_id';

    const serializeParams = {
        field,
        value,
        model,
        getDefaultModelName,
        schema,
        customIdGen
    };

    let condition: Record<string, any>;

    switch (operator.toLowerCase()) {
        case 'eq':
            condition = { [field]: serializeID(serializeParams) };
            break;

        case 'in':
            condition = {
                [field]: {
                    $in: Array.isArray(value)
                        ? value.map((v: any) =>
                              serializeID({ ...serializeParams, value: v })
                          )
                        : [serializeID(serializeParams)]
                }
            };
            break;

        case 'not_in':
            condition = {
                [field]: {
                    $nin: Array.isArray(value)
                        ? value.map((v: any) =>
                              serializeID({ ...serializeParams, value: v })
                          )
                        : [serializeID(serializeParams)]
                }
            };
            break;

        case 'gt':
            condition = { [field]: { $gt: serializeID(serializeParams) } };
            break;

        case 'gte':
            condition = { [field]: { $gte: serializeID(serializeParams) } };
            break;

        case 'lt':
            condition = { [field]: { $lt: serializeID(serializeParams) } };
            break;

        case 'lte':
            condition = { [field]: { $lte: serializeID(serializeParams) } };
            break;

        case 'ne':
            condition = { [field]: { $ne: serializeID(serializeParams) } };
            break;

        case 'contains':
            condition = {
                [field]: {
                    $regex: `.*${escapeForMongoRegex(value as string)}.*`
                }
            };
            break;

        case 'starts_with':
            condition = {
                [field]: { $regex: `^${escapeForMongoRegex(value as string)}` }
            };
            break;

        case 'ends_with':
            condition = {
                [field]: { $regex: `${escapeForMongoRegex(value as string)}$` }
            };
            break;

        default:
            throw new Error(`Unsupported operator: ${operator}`);
    }

    return { condition, connector };
}

/**
 * Convert Better Auth Where clauses to MongoDB query format
 */
export function convertWhereClause(params: {
    where: Where[];
    model: string;
    getFieldName: (params: { model: string; field: string }) => string;
    getDefaultModelName: (model: string) => string;
    schema: AdapterSchema;
    customIdGen: ReturnType<typeof getCustomIdGenerator>;
}): Record<string, any> {
    const {
        where,
        model,
        getFieldName,
        getDefaultModelName,
        schema,
        customIdGen
    } = params;

    if (!where.length) return {};

    const conditions = where.map(w =>
        buildCondition({
            w,
            model,
            getFieldName,
            getDefaultModelName,
            schema,
            customIdGen
        })
    );

    if (conditions.length === 1) {
        return conditions[0]!.condition;
    }

    const andConditions = conditions
        .filter(c => c.connector === 'AND')
        .map(c => c.condition);

    const orConditions = conditions
        .filter(c => c.connector === 'OR')
        .map(c => c.condition);

    let clause: Record<string, any> = {};

    if (andConditions.length) {
        clause = { ...clause, $and: andConditions };
    }

    if (orConditions.length) {
        clause = { ...clause, $or: orConditions };
    }

    return clause;
}

// #endregion

// #region Join Pipeline Helpers

/**
 * Join configuration from Better Auth
 */
export interface JoinConfig {
    on: { from: string; to: string };
    limit?: number;
    relation?: 'one-to-one' | 'one-to-many';
}

/**
 * Build a $lookup stage for MongoDB aggregation pipeline
 */
export function buildLookupStage(params: {
    joinedModel: string;
    joinConfig: JoinConfig;
    model: string;
    getFieldName: (params: { model: string; field: string }) => string;
    isUnique: boolean;
    limit: number;
}): Document[] {
    const { joinedModel, joinConfig, model, getFieldName, isUnique, limit } =
        params;

    const localField = getFieldName({ field: joinConfig.on.from, model });
    const foreignField = getFieldName({
        field: joinConfig.on.to,
        model: joinedModel
    });

    const localFieldName = localField === 'id' ? '_id' : localField;
    const foreignFieldName = foreignField === 'id' ? '_id' : foreignField;

    const shouldLimit = !isUnique && joinConfig.limit !== undefined;

    const stages: Document[] = [];

    if (shouldLimit && limit > 0) {
        // Use pipeline syntax to support limit
        const foreignFieldRef = `$${foreignFieldName}`;
        stages.push({
            $lookup: {
                from: joinedModel,
                let: { localFieldValue: `$${localFieldName}` },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: [foreignFieldRef, '$$localFieldValue']
                            }
                        }
                    },
                    { $limit: limit }
                ],
                as: joinedModel
            }
        });
    } else {
        // Use simple syntax when no limit is needed
        stages.push({
            $lookup: {
                from: joinedModel,
                localField: localFieldName,
                foreignField: foreignFieldName,
                as: joinedModel
            }
        });
    }

    if (isUnique) {
        // For one-to-one relationships, unwind to flatten to a single object
        stages.push({
            $unwind: {
                path: `$${joinedModel}`,
                preserveNullAndEmptyArrays: true
            }
        });
    }

    return stages;
}

// #endregion

// #region MongoDB Adapter Service

/**
 * NestJS Injectable MongoDB Adapter for Better Auth
 *
 * This service wraps the Better Auth MongoDB adapter functionality
 * and integrates with NestJS Dependency Injection via Mongoose connection.
 *
 * The adapter lazily initializes when the MongoDB connection is ready,
 * supporting both immediate and lazy Mongoose connections.
 */
@Injectable()
export class NestJSMongoDBAdapterService implements OnModuleInit {
    private readonly logger = new Logger(NestJSMongoDBAdapterService.name);
    private db: Db | null = null;
    private lazyOptions: BetterAuthOptions | null = null;
    private lazyAdapter:
        | ((options: BetterAuthOptions) => DBAdapter<BetterAuthOptions>)
        | null = null;
    private adapterOptions: AdapterFactoryOptions | null = null;
    private initialized = false;
    private initPromise: Promise<void> | null = null;

    constructor(
        @Inject(getConnectionToken())
        private readonly connection: Connection,
        @Optional()
        @Inject(NESTJS_MONGODB_ADAPTER_CONFIG)
        private readonly config?: NestJSMongoDBAdapterConfig
    ) {}

    /**
     * Called when the module is initialized.
     * Waits for the MongoDB connection to be ready before initializing the adapter.
     */
    async onModuleInit(): Promise<void> {
        await this.ensureInitialized();
    }

    /**
     * Ensure the adapter is initialized, waiting for connection if needed.
     * This method is idempotent and can be called multiple times safely.
     */
    async ensureInitialized(): Promise<void> {
        if (this.initialized) {
            return;
        }

        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this.waitForConnectionAndInitialize();
        await this.initPromise;
    }

    /**
     * Wait for the MongoDB connection to be ready, then initialize the adapter
     */
    private async waitForConnectionAndInitialize(): Promise<void> {
        // Check if already connected
        if (this.connection.readyState === 1 && this.connection.db) {
            this.db = this.connection.db;
            this.initializeAdapter();
            this.initialized = true;
            this.logger.log(
                'MongoDB adapter initialized (connection already ready)'
            );
            return;
        }

        // Wait for connection
        this.logger.log('Waiting for MongoDB connection...');

        await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(
                    new Error('MongoDB connection timeout after 30 seconds')
                );
            }, 30000);

            const onConnected = () => {
                clearTimeout(timeout);
                this.connection.off('error', onError);
                resolve();
            };

            const onError = (err: Error) => {
                clearTimeout(timeout);
                this.connection.off('connected', onConnected);
                reject(err);
            };

            this.connection.once('connected', onConnected);
            this.connection.once('error', onError);
        });

        // Now the connection should be ready
        if (!this.connection.db) {
            throw new Error(
                'MongoDB connection established but database is not available'
            );
        }

        this.db = this.connection.db;
        this.initializeAdapter();
        this.initialized = true;
        this.logger.log('MongoDB adapter initialized');
    }

    /**
     * Initialize the Better Auth adapter factory
     */
    private initializeAdapter(): void {
        this.adapterOptions = this.createAdapterOptions();
        this.lazyAdapter = createAdapterFactory(this.adapterOptions);
    }

    /**
     * Create the adapter factory options
     */
    private createAdapterOptions(): AdapterFactoryOptions {
        const config = this.config ?? {};

        return {
            config: {
                adapterId: 'nestjs-mongodb-adapter',
                adapterName: 'NestJS MongoDB Adapter',
                usePlural: config.usePlural ?? false,
                debugLogs: config.debugLogs ?? false,
                mapKeysTransformInput: { id: '_id' },
                mapKeysTransformOutput: { _id: 'id' },
                supportsNumericIds: false,
                transaction: this.createTransactionHandler(config),
                customTransformInput: this.createCustomTransformInput(),
                customTransformOutput: this.createCustomTransformOutput(),
                customIdGenerator: () => new ObjectId().toString()
            },
            adapter: this.createCustomAdapter(this.db!)
        };
    }

    /**
     * Create the transaction handler if transactions are enabled
     */
    private createTransactionHandler(config: NestJSMongoDBAdapterConfig) {
        const client = this.connection.getClient();

        if (!client || !(config.transaction ?? true)) {
            return false;
        }

        return async <T>(
            cb: (adapter: DBAdapter<BetterAuthOptions>) => Promise<T>
        ): Promise<T> => {
            const session = client.startSession();

            try {
                session.startTransaction();

                const adapter = createAdapterFactory({
                    config: this.adapterOptions!.config,
                    adapter: this.createCustomAdapter(this.db!, session)
                })(this.lazyOptions!);

                const result = await cb(adapter);

                await session.commitTransaction();
                return result;
            } catch (err) {
                await session.abortTransaction();
                throw err;
            } finally {
                await session.endSession();
            }
        };
    }

    /**
     * Create the custom transform input function
     */
    private createCustomTransformInput(): AdapterFactoryOptions['config']['customTransformInput'] {
        return ({ action, data, field, fieldAttributes, options }) => {
            const customIdGen = getCustomIdGenerator(options);

            if (field === '_id' || fieldAttributes.references?.field === 'id') {
                if (customIdGen) {
                    return data;
                }

                if (action === 'update') {
                    return data;
                }

                if (Array.isArray(data)) {
                    return data.map((v: any) => {
                        if (typeof v === 'string') {
                            try {
                                return new ObjectId(v);
                            } catch {
                                return v;
                            }
                        }
                        return v;
                    });
                }

                if (typeof data === 'string') {
                    try {
                        return new ObjectId(data);
                    } catch {
                        return data;
                    }
                }

                if (
                    fieldAttributes.references?.field === 'id' &&
                    !fieldAttributes.required &&
                    data === null
                ) {
                    return null;
                }

                return new ObjectId();
            }

            return data;
        };
    }

    /**
     * Create the custom transform output function
     */
    private createCustomTransformOutput(): AdapterFactoryOptions['config']['customTransformOutput'] {
        return ({ data, field, fieldAttributes }) => {
            if (field === 'id' || fieldAttributes.references?.field === 'id') {
                if (data instanceof ObjectId) {
                    return data.toHexString();
                }

                if (Array.isArray(data)) {
                    return data.map((v: any) => {
                        if (v instanceof ObjectId) {
                            return v.toHexString();
                        }
                        return v;
                    });
                }

                return data;
            }

            return data;
        };
    }

    /**
     * Create the custom adapter implementation
     */
    private createCustomAdapter(
        db: Db,
        session?: ClientSession
    ): AdapterFactoryCustomizeAdapterCreator {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;

        return ({
            getFieldAttributes,
            getFieldName,
            schema,
            getDefaultModelName,
            options
        }) => {
            const customIdGen = getCustomIdGenerator(options);
            const defaultLimit =
                options.advanced?.database?.defaultFindManyLimit ?? 100;

            const getWhereParams = (model: string, where: Where[]) => ({
                where,
                model,
                getFieldName,
                getDefaultModelName,
                schema: schema as AdapterSchema,
                customIdGen
            });

            return {
                async create({ model, data: values }) {
                    const res = await db
                        .collection(model)
                        .insertOne(values, { session });
                    const insertedData = {
                        _id: res.insertedId.toString(),
                        ...values
                    };
                    return insertedData as any;
                },

                async findOne({ model, where, select, join }) {
                    const pipeline = self.buildFindOnePipeline({
                        model,
                        where,
                        select,
                        join: join as Record<string, JoinConfig> | undefined,
                        getFieldName,
                        getDefaultModelName,
                        getFieldAttributes,
                        schema: schema as AdapterSchema,
                        customIdGen,
                        defaultLimit
                    });

                    const res = await db
                        .collection(model)
                        .aggregate(pipeline, { session })
                        .toArray();

                    if (!res || res.length === 0) return null;
                    return res[0] as any;
                },

                async findMany({ model, where, limit, offset, sortBy, join }) {
                    const pipeline = self.buildFindManyPipeline({
                        model,
                        where,
                        limit,
                        offset,
                        sortBy,
                        join: join as Record<string, JoinConfig> | undefined,
                        getFieldName,
                        getDefaultModelName,
                        getFieldAttributes,
                        schema: schema as AdapterSchema,
                        customIdGen,
                        defaultLimit
                    });

                    const res = await db
                        .collection(model)
                        .aggregate(pipeline, { session })
                        .toArray();

                    return res as any;
                },

                async count({ model, where }) {
                    const matchStage = where
                        ? {
                              $match: convertWhereClause(
                                  getWhereParams(model, where)
                              )
                          }
                        : { $match: {} };

                    const pipeline: Document[] = [
                        matchStage,
                        { $count: 'total' }
                    ];

                    const res = await db
                        .collection(model)
                        .aggregate(pipeline, { session })
                        .toArray();

                    if (!res || res.length === 0) return 0;
                    return res[0]?.total ?? 0;
                },

                async update({ model, where, update: values }) {
                    const clause = convertWhereClause(
                        getWhereParams(model, where)
                    );

                    const res = await db.collection(model).findOneAndUpdate(
                        clause,
                        { $set: values as any },
                        {
                            session,
                            returnDocument: 'after',
                            includeResultMetadata: true
                        }
                    );

                    const doc = (res as any)?.value ?? null;
                    if (!doc) return null;
                    return doc as any;
                },

                async updateMany({ model, where, update: values }) {
                    const clause = convertWhereClause(
                        getWhereParams(model, where)
                    );

                    const res = await db
                        .collection(model)
                        .updateMany(
                            clause,
                            { $set: values as any },
                            { session }
                        );

                    return res.modifiedCount;
                },

                async delete({ model, where }) {
                    const clause = convertWhereClause(
                        getWhereParams(model, where)
                    );
                    await db.collection(model).deleteOne(clause, { session });
                },

                async deleteMany({ model, where }) {
                    const clause = convertWhereClause(
                        getWhereParams(model, where)
                    );
                    const res = await db
                        .collection(model)
                        .deleteMany(clause, { session });
                    return res.deletedCount;
                }
            };
        };
    }

    /**
     * Build aggregation pipeline for findOne operation
     */
    private buildFindOnePipeline(params: {
        model: string;
        where: Where[] | undefined;
        select: string[] | undefined;
        join: Record<string, JoinConfig> | undefined;
        getFieldName: (params: { model: string; field: string }) => string;
        getDefaultModelName: (model: string) => string;
        getFieldAttributes: (params: { model: string; field: string }) => any;
        schema: AdapterSchema;
        customIdGen: ReturnType<typeof getCustomIdGenerator>;
        defaultLimit: number;
    }): Document[] {
        const {
            model,
            where,
            select,
            join,
            getFieldName,
            getDefaultModelName,
            schema,
            customIdGen,
            defaultLimit
        } = params;

        const matchStage = where
            ? {
                  $match: convertWhereClause({
                      where,
                      model,
                      getFieldName,
                      getDefaultModelName,
                      schema,
                      customIdGen
                  })
              }
            : { $match: {} };

        const pipeline: Document[] = [matchStage];

        if (join) {
            for (const [joinedModel, joinConfig] of Object.entries(join)) {
                const joinedModelSchema =
                    schema[getDefaultModelName(joinedModel)];
                const foreignFieldAttribute =
                    joinedModelSchema?.fields[joinConfig.on.to];
                const isUnique = foreignFieldAttribute?.unique === true;

                const lookupStages = buildLookupStage({
                    joinedModel,
                    joinConfig,
                    model,
                    getFieldName,
                    isUnique,
                    limit: joinConfig.limit ?? defaultLimit
                });

                pipeline.push(...lookupStages);
            }
        }

        if (select) {
            const projection: Record<string, number> = {};
            select.forEach(field => {
                projection[getFieldName({ field, model })] = 1;
            });

            if (join) {
                for (const joinedModel of Object.keys(join)) {
                    projection[joinedModel] = 1;
                }
            }

            pipeline.push({ $project: projection });
        }

        pipeline.push({ $limit: 1 });

        return pipeline;
    }

    /**
     * Build aggregation pipeline for findMany operation
     */
    private buildFindManyPipeline(params: {
        model: string;
        where: Where[] | undefined;
        limit: number | undefined;
        offset: number | undefined;
        sortBy: { field: string; direction: 'asc' | 'desc' } | undefined;
        join: Record<string, JoinConfig> | undefined;
        getFieldName: (params: { model: string; field: string }) => string;
        getDefaultModelName: (model: string) => string;
        getFieldAttributes: (params: { model: string; field: string }) => any;
        schema: AdapterSchema;
        customIdGen: ReturnType<typeof getCustomIdGenerator>;
        defaultLimit: number;
    }): Document[] {
        const {
            model,
            where,
            limit,
            offset,
            sortBy,
            join,
            getFieldName,
            getDefaultModelName,
            getFieldAttributes,
            schema,
            customIdGen,
            defaultLimit
        } = params;

        const matchStage = where
            ? {
                  $match: convertWhereClause({
                      where,
                      model,
                      getFieldName,
                      getDefaultModelName,
                      schema,
                      customIdGen
                  })
              }
            : { $match: {} };

        const pipeline: Document[] = [matchStage];

        if (join) {
            for (const [joinedModel, joinConfig] of Object.entries(join)) {
                const foreignFieldAttribute = getFieldAttributes({
                    model: joinedModel,
                    field: joinConfig.on.to
                });
                const isUnique = foreignFieldAttribute?.unique === true;

                // For findMany, check relation type instead of unique constraint for limit
                const shouldLimit =
                    joinConfig.relation !== 'one-to-one' &&
                    joinConfig.limit !== undefined;

                const lookupStages = buildLookupStage({
                    joinedModel,
                    joinConfig,
                    model,
                    getFieldName,
                    isUnique,
                    limit: shouldLimit
                        ? (joinConfig.limit ?? defaultLimit)
                        : defaultLimit
                });

                pipeline.push(...lookupStages);
            }
        }

        if (sortBy) {
            pipeline.push({
                $sort: {
                    [getFieldName({ field: sortBy.field, model })]:
                        sortBy.direction === 'desc' ? -1 : 1
                }
            });
        }

        if (offset) {
            pipeline.push({ $skip: offset });
        }

        if (limit) {
            pipeline.push({ $limit: limit });
        }

        return pipeline;
    }

    /**
     * Get the configured adapter for use with Better Auth
     *
     * @returns A function that takes BetterAuthOptions and returns a DBAdapter
     * @throws Error if the adapter has not been initialized yet
     * @deprecated Use getAdapterAsync() instead to ensure proper initialization
     */
    getAdapter(): DBAdapterInstance {
        if (!this.initialized || !this.lazyAdapter) {
            throw new Error(
                'MongoDB adapter not initialized. Ensure onModuleInit() has completed before calling getAdapter().'
            );
        }
        return (options: BetterAuthOptions): DBAdapter<BetterAuthOptions> => {
            this.lazyOptions = options;
            return this.lazyAdapter!(options);
        };
    }

    /**
     * Get the configured adapter for use with Better Auth, ensuring initialization first.
     * This is the preferred method for async factory providers.
     *
     * @returns A promise that resolves to a function that takes BetterAuthOptions and returns a DBAdapter
     */
    async getAdapterAsync(): Promise<DBAdapterInstance> {
        await this.ensureInitialized();
        return this.getAdapter();
    }

    /**
     * Get the underlying MongoDB database instance
     * @throws Error if the adapter has not been initialized yet
     */
    getDatabase(): Db {
        if (!this.db) {
            throw new Error(
                'MongoDB adapter not initialized. Call ensureInitialized() first or wait for onModuleInit().'
            );
        }
        return this.db;
    }
}

// #endregion
