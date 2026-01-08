import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComment extends Document {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  authorId: Types.ObjectId;
  content: string;
  images: string[];
  cloudinaryPublicIds: string[];
  parentCommentId?: Types.ObjectId | null;
  level?: number;
  mentionedUserId?: Types.ObjectId | null;
  likes: Types.ObjectId[];
  likesCount: number;
  repliesCount: number;
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  images: { type: [String], default: [] },
  cloudinaryPublicIds: { type: [String], default: [] },
  parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
  level: { type: Number, default: 0 },
  mentionedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  likesCount: { type: Number, default: 0, min: 0 },
  repliesCount: { type: Number, default: 0, min: 0 },
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date }
}, { timestamps: true, collection: 'comments' });

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
export default Comment;