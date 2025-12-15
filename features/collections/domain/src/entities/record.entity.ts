import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType, ID } from '@nestjs/graphql';
import { IsString, IsObject, IsNumber } from 'class-validator';
import { Document, Types } from 'mongoose';

import { CollectionRecord as ICollectionRecord } from '@cbnsndwch/struktura-schema-contracts';

export type RecordDocument = Record &
    Document & {
        createdAt: Date;
        updatedAt: Date;
    };

@ObjectType('Record')
@Schema({ collection: 'records', timestamps: true })
export class Record implements ICollectionRecord {
    @Field(() => ID)
    id!: string;

    @Prop({ type: Types.ObjectId, ref: 'Collection', required: true, index: true })
    @Field(() => String)
    @IsString()
    collectionId!: string;

    @Prop({ type: Object, required: true })
    @IsObject()
    data!: { [key: string]: unknown };

    @Prop({ type: String, required: true })
    @Field()
    @IsString()
    createdBy!: string;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsString()
    modifiedBy?: string;

    @Prop({ type: Number, default: 1 })
    @Field()
    @IsNumber()
    version!: number;

    @Field()
    createdAt!: Date;

    @Field()
    updatedAt!: Date;

    /**
     * Create a Record instance from data object.
     * @param data - Record data conforming to ICollectionRecord
     * @returns Record instance
     * @todo Add validation to ensure data integrity before assignment
     */
    static fromData(data: ICollectionRecord): Record {
        const record = new Record();
        Object.assign(record, data);
        return record;
    }

    toData(): ICollectionRecord {
        return {
            id: this.id,
            collectionId: this.collectionId,
            data: this.data,
            createdBy: this.createdBy,
            modifiedBy: this.modifiedBy,
            version: this.version,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

export const RecordSchema = SchemaFactory.createForClass(Record);

// Add indexes for better query performance
RecordSchema.index({ collectionId: 1, createdAt: -1 });
RecordSchema.index({ collectionId: 1, updatedAt: -1 });
