import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({
    timestamps: true,
    collection: 'refresh_tokens',
})
export class RefreshToken {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    userId!: mongoose.Types.ObjectId;

    @Prop({ type: String, required: true })
    token!: string;

    @Prop({ type: Date, required: true })
    expiresAt!: Date;

    @Prop({ type: Boolean, default: false })
    revoked!: boolean;

    @Prop({ type: String })
    userAgent?: string;

    @Prop({ type: String })
    ipAddress?: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

// Add indexes
RefreshTokenSchema.index({ token: 1 }, { unique: true });
RefreshTokenSchema.index({ userId: 1 });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
RefreshTokenSchema.index({ revoked: 1 });