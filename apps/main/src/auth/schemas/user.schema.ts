import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
    timestamps: true,
    collection: 'users',
})
export class User {
    @Prop({ type: String, required: true })
    email!: string;

    @Prop({ type: String, required: true })
    name!: string;

    @Prop({ type: String, required: true })
    passwordHash!: string;

    @Prop({ type: Boolean, default: false })
    emailVerified!: boolean;

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
        default: ['editor'],
    })
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
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add indexes for performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ emailVerificationToken: 1 });
UserSchema.index({ passwordResetToken: 1 });
UserSchema.index({ roles: 1 });
UserSchema.index({ 'oauthProviders.google.id': 1 });
UserSchema.index({ 'oauthProviders.github.id': 1 });