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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PostSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID là bắt buộc'],
        index: true
    },
    content: {
        type: String,
        required: [true, 'Nội dung bài viết là bắt buộc'],
        maxlength: [10000, 'Nội dung bài viết không được vượt quá 10,000 ký tự'],
        trim: true
    },
    images: {
        type: [String],
        default: [],
        validate: {
            validator: function (v) {
                return v.length <= 10;
            },
            message: 'Số lượng hình ảnh không được vượt quá 10'
        }
    },
    cloudinaryPublicIds: {
        type: [String],
        default: []
    },
    videos: {
        type: [String],
        default: [],
        validate: {
            validator: function (v) {
                return v.length <= 2;
            },
            message: 'Số lượng video không được vượt quá 2'
        }
    },
    videoPublicIds: {
        type: [String],
        default: []
    },
    likes: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    likesCount: {
        type: Number,
        default: 0,
        min: 0
    },
    commentsCount: {
        type: Number,
        default: 0,
        min: 0
    },
    sharesCount: {
        type: Number,
        default: 0,
        min: 0
    },
    visibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public'
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date
    },
    originalPostId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Post'
    },
    sharedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    collection: 'posts'
});
// Indexes for efficient querying
PostSchema.index({ userId: 1, createdAt: -1 });
PostSchema.index({ visibility: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ likesCount: -1 });
PostSchema.index({ commentsCount: -1 });
PostSchema.index({ sharesCount: -1 });
PostSchema.index({ originalPostId: 1 });
PostSchema.index({ content: 'text' }); // Text index for search
// Compound index for feed queries
PostSchema.index({ visibility: 1, userId: 1, createdAt: -1 });
// Virtual for engagement rate
PostSchema.virtual('engagementRate').get(function () {
    const ageInHours = Math.max(1, Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60)));
    const totalEngagements = this.likesCount + this.commentsCount + this.sharesCount;
    return totalEngagements / ageInHours;
});
// Remove sensitive fields from JSON output
PostSchema.methods.toJSON = function () {
    const postObject = this.toObject();
    return postObject;
};
exports.Post = mongoose_1.default.model('Post', PostSchema);
