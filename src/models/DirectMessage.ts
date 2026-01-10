import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IChatAttachment {
  url: string;
  type?: string | null;
  name?: string | null;
}

export interface IChatParticipantMeta {
  userId: Types.ObjectId;
  userName?: string | null;
  avatar?: string | null;
}

export interface IChatThread extends Document {
  participants: Types.ObjectId[];
  participantsKey: string;
  participantMeta: IChatParticipantMeta[];
  lastMessage?: string | null;
  lastMessageAt?: Date | null;
  lastSender?: Types.ObjectId | null;
  unreadCounts: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatMessage extends Document {
  threadId: Types.ObjectId;
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  content?: string;
  attachments: IChatAttachment[];
  readAt?: Date | null;
  createdAt: Date;
}

const AttachmentSchema = new Schema<IChatAttachment>({
  url: { type: String, required: true, trim: true },
  type: { type: String, default: null },
  name: { type: String, default: null }
}, { _id: false });

const ParticipantMetaSchema = new Schema<IChatParticipantMeta>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, default: null },
  avatar: { type: String, default: null }
}, { _id: false });

const ChatThreadSchema = new Schema<IChatThread>({
  participants: {
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    required: true,
    validate: {
      validator: (value: Types.ObjectId[]) => Array.isArray(value) && value.length === 2,
      message: 'Thread must have exactly 2 participants'
    }
  },
  participantsKey: { type: String, required: true, unique: true },
  participantMeta: { type: [ParticipantMetaSchema], default: [] },
  lastMessage: { type: String, default: null },
  lastMessageAt: { type: Date, default: null },
  lastSender: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  unreadCounts: { type: Map, of: Number, default: {} }
}, {
  timestamps: true,
  collection: 'chat_threads'
});

ChatThreadSchema.pre('validate', function(next) {
  if (Array.isArray(this.participants)) {
    const normalized = this.participants.map((id) => new mongoose.Types.ObjectId(id));
    normalized.sort((a, b) => (a.toString() > b.toString() ? 1 : -1));
    this.participants = normalized;
    this.participantsKey = normalized.map((id) => id.toString()).join(':');
  }
  next();
});

const ChatMessageSchema = new Schema<IChatMessage>({
  threadId: { type: Schema.Types.ObjectId, ref: 'ChatThread', required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, trim: true, maxlength: 4000, default: '' },
  attachments: { type: [AttachmentSchema], default: [] },
  readAt: { type: Date, default: null }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'chat_messages'
});

ChatMessageSchema.index({ threadId: 1, createdAt: -1 });
ChatMessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });

export const ChatThread = mongoose.model<IChatThread>('ChatThread', ChatThreadSchema);
export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
