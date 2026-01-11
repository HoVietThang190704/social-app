"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.Mixed,
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
    followers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    friends: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
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
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    if (!this.password)
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(12);
        const hashed = await bcryptjs_1.default.hash(this.password, salt);
        this.password = hashed;
        return next();
    }
    catch (err) {
        return next(err);
    }
});
// Compare password helper
UserSchema.methods.comparePassword = function (candidate) {
    if (!this.password)
        return Promise.resolve(false);
    return bcryptjs_1.default.compare(candidate, this.password);
};
// Remove sensitive fields from toJSON output
UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};
exports.User = mongoose_1.default.model('User', UserSchema);
exports.default = exports.User;
