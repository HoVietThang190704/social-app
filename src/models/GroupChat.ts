import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGroupChat extends Document {
  name: string;
  avatar?: string | null;
  members: Types.ObjectId[];
  admins: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const GroupChatSchema = new Schema<IGroupChat>({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  avatar: { type: String, default: null },
  members: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  admins: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }]
}, {
  timestamps: true,
  collection: 'group_chats'
});

GroupChatSchema.index({ members: 1, updatedAt: -1 });

export const GroupChat = mongoose.model<IGroupChat>('GroupChat', GroupChatSchema);
