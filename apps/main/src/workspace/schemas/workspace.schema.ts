import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkspaceDocument = Workspace &
    Document & {
        createdAt: Date;
        updatedAt: Date;
    };

@Schema({
    timestamps: true,
    collection: 'workspaces'
})
export class Workspace {
    @Prop({ type: String, required: true })
    name!: string;

    @Prop({ type: String, required: true, unique: true })
    slug!: string;

    @Prop({ type: String })
    description?: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    owner!: Types.ObjectId;

    @Prop({
        type: [
            {
                user: { type: Types.ObjectId, ref: 'User', required: true },
                role: {
                    type: String,
                    enum: ['owner', 'admin', 'editor', 'viewer'],
                    required: true
                },
                invitedAt: { type: Date, required: true },
                joinedAt: { type: Date }
            }
        ],
        default: []
    })
    members!: Array<{
        user: Types.ObjectId;
        role: 'owner' | 'admin' | 'editor' | 'viewer';
        invitedAt: Date;
        joinedAt?: Date;
    }>;

    @Prop({
        type: {
            timezone: { type: String, default: 'UTC' },
            dateFormat: { type: String, default: 'YYYY-MM-DD' },
            numberFormat: { type: String, default: 'en-US' }
        },
        default: {}
    })
    settings!: {
        timezone: string;
        dateFormat: string;
        numberFormat: string;
    };
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);

// Add indexes for performance
WorkspaceSchema.index({ slug: 1 }, { unique: true });
WorkspaceSchema.index({ owner: 1 });
WorkspaceSchema.index({ 'members.user': 1 });
WorkspaceSchema.index({ createdAt: 1 });
