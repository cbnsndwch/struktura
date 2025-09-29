import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType, ID } from '@nestjs/graphql';
import {
    IsEmail,
    IsString,
    MinLength,
    MaxLength,
    IsOptional,
    IsBoolean,
    IsArray,
    IsDate
} from 'class-validator';
import { Document } from 'mongoose';
import type { IUser, UserPreferences } from '@cbnsndwch/struktura-auth-contracts';

export type UserDocument = User & Document;

/**
 * Consolidated User class that serves as:
 * - Mongoose Schema (with @Prop decorators)
 * - GraphQL ObjectType (with @Field decorators)
 * - DTO with validation (with class-validator decorators)
 * - Domain Entity (implements IUser interface)
 */
@Schema({
    timestamps: true,
    collection: 'users'
})
@ObjectType('User', { description: 'User account information' })
export class User implements IUser {
    // Public fields - exposed in GraphQL and API responses
    @Field(() => ID)
    id!: string;

    @Prop({ type: String, required: true, unique: true })
    @Field()
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email!: string;

    @Prop({ type: String, required: true })
    @Field()
    @IsString()
    @MinLength(2, { message: 'Name must be at least 2 characters long' })
    @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
    name!: string;

    @Prop({ type: Boolean, default: false })
    @Field()
    @IsBoolean()
    emailVerified!: boolean;

    // Interface compliance - getter that maps to emailVerified
    get isVerified(): boolean {
        return this.emailVerified;
    }

    set isVerified(value: boolean) {
        this.emailVerified = value;
    }

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    timezone?: string;

    @Prop({ type: String })
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    language?: string;

    @Prop({ 
        type: Object,
        default: () => ({ theme: 'system' })
    })
    @Field({ nullable: true })
    @IsOptional()
    preferences?: UserPreferences;

    @Field()
    @IsDate()
    createdAt!: Date;

    @Field()
    @IsDate()
    updatedAt!: Date;

    // Internal fields - NOT exposed in GraphQL (no @Field decorator)
    @Prop({ type: String, required: true })
    // Note: No @Field decorator - this won't be exposed in GraphQL
    passwordHash!: string;

    @Prop({ type: String, default: null })
    emailVerificationToken?: string;

    @Prop({ type: Date, default: null })
    emailVerificationExpires?: Date;

    @Prop({ type: String, default: null })
    passwordResetToken?: string;

    @Prop({ type: Date, default: null })
    passwordResetExpires?: Date;

    @Prop({ type: Date })
    lastLoginAt?: Date;

    @Prop({
        type: [String],
        enum: ['admin', 'editor', 'viewer'],
        default: ['editor']
    })
    @Field(() => [String])
    @IsArray()
    @IsString({ each: true })
    roles!: string[];

    @Prop({ type: Object })
    profile?: {
        avatar?: string;
        timezone?: string;
        language?: string;
    };

    @Prop({ type: Object })
    oauthProviders?: {
        google?: {
            id: string;
            email: string;
        };
        github?: {
            id: string;
            username: string;
        };
    };

    // Domain methods
    static fromData(data: IUser): User {
        const user = new User();
        user.id = data.id;
        user.email = data.email;
        user.name = data.name;
        user.emailVerified = data.isVerified; // Store as emailVerified in DB
        user.createdAt = data.createdAt;
        user.updatedAt = data.updatedAt;
        user.timezone = data.timezone;
        user.language = data.language;
        user.preferences = data.preferences;
        return user;
    }

    toData(): IUser {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            isVerified: this.emailVerified, // Map from emailVerified to isVerified
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            timezone: this.timezone,
            language: this.language,
            preferences: this.preferences
        };
    }

    // Utility method to get public user data (safe for API responses)
    toPublicData() {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            isVerified: this.emailVerified, // Use emailVerified for consistency
            roles: this.roles,
            timezone: this.timezone,
            language: this.language,
            preferences: this.preferences,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add indexes for performance
// Note: email index is handled by unique: true in @Prop decorator
UserSchema.index({ emailVerificationToken: 1 });
UserSchema.index({ passwordResetToken: 1 });
UserSchema.index({ roles: 1 });
UserSchema.index({ 'oauthProviders.google.id': 1 });
UserSchema.index({ 'oauthProviders.github.id': 1 });
