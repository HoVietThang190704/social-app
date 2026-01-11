import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password?: string;
  userName: string;
  avatar?: string;
  cloudinaryPublicId?: string;
  bio?: string;
  phone?: string;
  date_of_birth?: Date;
  address?: any;
  role: string;
  isVerified: boolean;
  locked: boolean;
  facebookId?: string;
  googleId?: string;
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  friends: Types.ObjectId[];
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  postsCount: number;
  pushToken?: string;
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String
  },
  userName: {
    type: String,
    required: [true, 'Tên người dùng là bắt buộc'],
    trim: true,
    maxlength: 100
  },
  avatar: {
    type: String
  },
  cloudinaryPublicId: {
    type: String
  },
  bio: {
    type: String,
    maxlength: 2000
  },
  phone: {
    type: String,
    index: true
  },
  date_of_birth: {
    type: Date
  },
  address: {
    type: Schema.Types.Mixed,
  },
  role: {
    type: String,
    default: 'customer'
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  locked: {
    type: Boolean,
    default: false
  },
  facebookId: {
    type: String,
    index: true
  },
  googleId: {
    type: String,
    index: true
  },
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  followersCount: { type: Number, default: 0, min: 0 },
  followingCount: { type: Number, default: 0, min: 0 },
  friendsCount: { type: Number, default: 0, min: 0 },
  postsCount: { type: Number, default: 0, min: 0 },
  pushToken: { type: String, default: null },
  lastActive: { type: Date }
}, {
  timestamps: true,
  collection: 'users'
});

// Indexes for common queries
UserSchema.index({ email: 1 });
UserSchema.index({ userName: 'text', bio: 'text' });

// Hash password before save if modified
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (!this.password) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(this.password, salt);
    this.password = hashed;
    return next();
  } catch (err) {
    return next(err as any);
  }
});

// Compare password helper
UserSchema.methods.comparePassword = function(candidate: string): Promise<boolean> {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

// Remove sensitive fields from toJSON output
UserSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.model<IUser>('User', UserSchema);
export default User;