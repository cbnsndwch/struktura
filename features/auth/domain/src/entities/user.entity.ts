import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Document } from 'mongoose';

import { parseUserPreferences } from './user-preferences.entity.js';

export type UserDocument = User & Document;

/**
 * User schema that maps to Better Auth's ba_user collection.
 *
 * This schema is used by Mongoose for populate operations on workspace members.
 * Better Auth manages this collection directly, we only read from it.
 */
@Schema({
    collection: 'ba_user',
    versionKey: false,
    timestamps: false // Better Auth manages timestamps
})
@ObjectType('User', { description: 'Better Auth user information' })
export class User {
    @Field(() => ID)
    id!: string;

    @Prop({ type: String, required: true })
    @Field()
    name!: string;

    @Prop({ type: String, required: true, unique: true })
    @Field()
    email!: string;

    @Prop({ type: Boolean, default: false })
    @Field()
    emailVerified!: boolean;

    @Prop({ type: String })
    @Field({ nullable: true })
    image?: string;

    @Prop({ type: String, default: 'user' })
    @Field()
    roles!: string;

    @Prop({ type: String })
    preferences?: string;

    @Prop({ type: Date })
    @Field()
    createdAt!: Date;

    @Prop({ type: Date })
    @Field()
    updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transform = (_doc: UserDocument, ret: any) => {
    ret.id = ret._id?.toString();
    ret.preferences = parseUserPreferences(ret.preferences);

    delete ret._id;
    delete ret.__v;

    return ret;
};

// Add virtual for id to map from _id, and transform preferences field
UserSchema.set('toJSON', { virtuals: true, transform });
UserSchema.set('toObject', { virtuals: true, transform });
