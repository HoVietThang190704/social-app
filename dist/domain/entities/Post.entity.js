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
exports.PostEntity = void 0;
class PostEntity {
    constructor(data) {
        this.id = data.id;
        this.userId = data.userId;
        this.content = data.content;
        this.images = data.images || [];
        this.cloudinaryPublicIds = data.cloudinaryPublicIds || [];
        this.likes = data.likes || [];
        this.likesCount = data.likesCount || 0;
        this.commentsCount = data.commentsCount || 0;
        this.sharesCount = data.sharesCount || 0;
        this.visibility = data.visibility || 'public';
        this.isEdited = data.isEdited || false;
        this.editedAt = data.editedAt;
        this.originalPostId = data.originalPostId;
        this.sharedBy = data.sharedBy;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
    isLikedBy(userId) {
        return this.likes.includes(userId);
    }
    toggleLike(userId) {
        const index = this.likes.indexOf(userId);
        if (index > -1) {
            this.likes.splice(index, 1);
            this.likesCount = Math.max(0, this.likesCount - 1);
            return false;
        }
        else {
            this.likes.push(userId);
            this.likesCount += 1;
            return true;
        }
    }
    addLike(userId) {
        if (this.isLikedBy(userId)) {
            return false;
        }
        this.likes.push(userId);
        this.likesCount += 1;
        return true;
    }
    removeLike(userId) {
        const index = this.likes.indexOf(userId);
        if (index === -1) {
            return false;
        }
        this.likes.splice(index, 1);
        this.likesCount = Math.max(0, this.likesCount - 1);
        return true;
    }
    incrementCommentsCount() {
        this.commentsCount += 1;
    }
    decrementCommentsCount() {
        this.commentsCount = Math.max(0, this.commentsCount - 1);
    }
    incrementSharesCount() {
        this.sharesCount += 1;
    }
    isSharedPost() {
        return !!this.originalPostId;
    }
    hasImages() {
        return this.images.length > 0;
    }
    isPublic() {
        return this.visibility === 'public';
    }
    isOwnedBy(userId) {
        return this.userId === userId;
    }
    canBeViewedBy(userId, isFriend = false) {
        if (this.isOwnedBy(userId)) {
            return true;
        }
        switch (this.visibility) {
            case 'public':
                return true;
            case 'friends':
                return isFriend;
            case 'private':
                return false;
            default:
                return false;
        }
    }
    canBeEditedBy(userId) {
        return this.isOwnedBy(userId);
    }
    canBeDeletedBy(userId, isAdmin = false) {
        return this.isOwnedBy(userId) || isAdmin;
    }
    updateContent(newContent) {
        if (!newContent || newContent.trim().length === 0) {
            throw new Error('Nội dung bài viết không được để trống');
        }
        this.content = newContent.trim();
        this.isEdited = true;
        this.editedAt = new Date();
        this.updatedAt = new Date();
    }
    updateImages(images, cloudinaryPublicIds) {
        this.images = images;
        this.cloudinaryPublicIds = cloudinaryPublicIds;
        this.isEdited = true;
        this.editedAt = new Date();
        this.updatedAt = new Date();
    }
    updateVisibility(visibility) {
        this.visibility = visibility;
        this.updatedAt = new Date();
    }
    getAgeInHours() {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
        return Math.floor(diffTime / (1000 * 60 * 60));
    }
    getAgeInDays() {
        return Math.floor(this.getAgeInHours() / 24);
    }
    isRecent() {
        return this.getAgeInHours() < 24;
    }
    getEngagementRate() {
        const ageInHours = Math.max(1, this.getAgeInHours());
        const totalEngagements = this.likesCount + this.commentsCount + this.sharesCount;
        return totalEngagements / ageInHours;
    }
    isTrending(threshold = 10) {
        return this.getEngagementRate() >= threshold;
    }
    async validate() {
        try {
            const { postEntitySchema } = await Promise.resolve().then(() => __importStar(require('../../shared/validation/post.schema')));
            postEntitySchema.parse({
                id: this.id,
                userId: this.userId,
                content: this.content,
                images: this.images,
                cloudinaryPublicIds: this.cloudinaryPublicIds,
                likes: this.likes,
                likesCount: this.likesCount,
                commentsCount: this.commentsCount,
                sharesCount: this.sharesCount,
                visibility: this.visibility,
                isEdited: this.isEdited,
                editedAt: this.editedAt,
                originalPostId: this.originalPostId,
                sharedBy: this.sharedBy,
                createdAt: this.createdAt,
                updatedAt: this.updatedAt
            });
            return { isValid: true, errors: [] };
        }
        catch (err) {
            const errors = [];
            if (err && err.errors && Array.isArray(err.errors)) {
                for (const e of err.errors) {
                    if (e?.message)
                        errors.push(String(e.message));
                    else
                        errors.push(String(e));
                }
            }
            else if (err && err.message) {
                errors.push(String(err.message));
            }
            else {
                errors.push('Invalid post entity');
            }
            return { isValid: errors.length === 0, errors };
        }
    }
}
exports.PostEntity = PostEntity;
