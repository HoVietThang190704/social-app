"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRepository = void 0;
const Comment_entity_1 = require("../../domain/entities/Comment.entity");
const Comment_1 = require("../../models/Comment");
const logger_1 = require("../../shared/utils/logger");
/**
 * Comment Repository Implementation using Mongoose
 */
class CommentRepository {
    /**
     * Map Mongoose document to Domain Entity
     */
    toDomainEntity(model) {
        const entity = new Comment_entity_1.CommentEntity({
            id: String(model._id),
            postId: String(model.postId),
            userId: String(model.userId?._id || model.userId),
            content: model.content,
            images: model.images,
            cloudinaryPublicIds: model.cloudinaryPublicIds,
            parentCommentId: model.parentCommentId ? String(model.parentCommentId) : undefined,
            level: model.level,
            mentionedUserId: model.mentionedUserId ? String(model.mentionedUserId) : undefined,
            likes: model.likes.map((id) => String(id)),
            likesCount: model.likesCount,
            repliesCount: model.repliesCount,
            isEdited: model.isEdited,
            editedAt: model.editedAt,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt
        });
        // Attach populated user data for DTO mapping
        if (model.userId && typeof model.userId === 'object') {
            entity.user = {
                id: String(model.userId._id),
                userName: model.userId.userName,
                email: model.userId.email,
                avatar: model.userId.avatar
            };
        }
        // Attach mentioned user data if present
        if (model.mentionedUserId && typeof model.mentionedUserId === 'object') {
            entity.mentionedUser = {
                id: String(model.mentionedUserId._id),
                userName: model.mentionedUserId.userName,
                email: model.mentionedUserId.email,
                avatar: model.mentionedUserId.avatar
            };
        }
        return entity;
    }
    buildFilter(filters) {
        const filter = {};
        if (!filters)
            return filter;
        if (filters.postId) {
            filter.postId = filters.postId;
        }
        if (filters.userId) {
            filter.userId = filters.userId;
        }
        if (filters.parentCommentId !== undefined) {
            if (filters.parentCommentId === null) {
                filter.parentCommentId = null;
            }
            else {
                filter.parentCommentId = filters.parentCommentId;
            }
        }
        if (filters.level !== undefined) {
            filter.level = filters.level;
        }
        if (filters.hasImages !== undefined) {
            filter[filters.hasImages ? 'images.0' : 'images'] = filters.hasImages ? { $exists: true } : { $size: 0 };
        }
        if (filters.minLikes !== undefined) {
            filter.likesCount = { $gte: filters.minLikes };
        }
        if (filters.createdAfter || filters.createdBefore) {
            filter.createdAt = {};
            if (filters.createdAfter) {
                filter.createdAt.$gte = filters.createdAfter;
            }
            if (filters.createdBefore) {
                filter.createdAt.$lte = filters.createdBefore;
            }
        }
        return filter;
    }
    /**
     * Build Mongoose sort from CommentSorting
     */
    buildSort(sorting) {
        if (!sorting) {
            return { createdAt: 1 }; // Default: oldest first (for chronological comments)
        }
        return { [sorting.sortBy]: sorting.order === 'asc' ? 1 : -1 };
    }
    async findById(id) {
        try {
            const comment = await Comment_1.Comment.findById(id)
                .populate('userId', 'userName email avatar')
                .populate('mentionedUserId', 'userName email avatar')
                .lean();
            if (!comment)
                return null;
            return this.toDomainEntity(comment);
        }
        catch (error) {
            logger_1.logger.error('Error finding comment by ID:', error);
            throw new Error('Lỗi khi tìm bình luận');
        }
    }
    async findAll(filters, sorting, pagination) {
        try {
            const filter = this.buildFilter(filters);
            const sort = this.buildSort(sorting);
            const page = pagination?.page || 1;
            const limit = pagination?.limit || 20;
            const skip = (page - 1) * limit;
            const [comments, total] = await Promise.all([
                Comment_1.Comment.find(filter)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .populate('userId', 'userName email avatar')
                    .populate('mentionedUserId', 'userName email avatar')
                    .lean(),
                Comment_1.Comment.countDocuments(filter)
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                comments: comments.map(comment => this.toDomainEntity(comment)),
                total,
                page,
                limit,
                totalPages,
                hasMore: page < totalPages
            };
        }
        catch (error) {
            logger_1.logger.error('Error finding comments:', error);
            throw new Error('Lỗi khi tìm bình luận');
        }
    }
    async create(commentData) {
        try {
            const comment = new Comment_1.Comment(commentData);
            const saved = await comment.save();
            const populated = await Comment_1.Comment.findById(saved._id)
                .populate('userId', 'userName email avatar')
                .populate('mentionedUserId', 'userName email avatar')
                .lean();
            return this.toDomainEntity(populated);
        }
        catch (error) {
            logger_1.logger.error('Error creating comment:', error);
            throw new Error('Lỗi khi tạo bình luận');
        }
    }
    async update(id, data) {
        try {
            const updated = await Comment_1.Comment.findByIdAndUpdate(id, { $set: { ...data, updatedAt: new Date() } }, { new: true, runValidators: true })
                .populate('userId', 'userName email avatar')
                .populate('mentionedUserId', 'userName email avatar')
                .lean();
            if (!updated)
                return null;
            return this.toDomainEntity(updated);
        }
        catch (error) {
            logger_1.logger.error('Error updating comment:', error);
            throw new Error('Lỗi khi cập nhật bình luận');
        }
    }
    async delete(id) {
        try {
            const result = await Comment_1.Comment.findByIdAndDelete(id);
            return !!result;
        }
        catch (error) {
            logger_1.logger.error('Error deleting comment:', error);
            throw new Error('Lỗi khi xóa bình luận');
        }
    }
    async findByPost(postId, options) {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const skip = (page - 1) * limit;
        const [comments, total] = await Promise.all([
            Comment_1.Comment.find({ postId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'userName email avatar')
                .lean(),
            Comment_1.Comment.countDocuments({ postId })
        ]);
        return { items: comments.map(c => this.toDomainEntity(c)), total };
    }
    async count(filters) {
        try {
            const filter = this.buildFilter(filters);
            return await Comment_1.Comment.countDocuments(filter);
        }
        catch (error) {
            logger_1.logger.error('Error counting comments:', error);
            throw new Error('Lỗi khi đếm bình luận');
        }
    }
    async exists(id) {
        try {
            const count = await Comment_1.Comment.countDocuments({ _id: id });
            return count > 0;
        }
        catch (error) {
            logger_1.logger.error('Error checking comment exists:', error);
            return false;
        }
    }
    async findByPostId(postId, pagination) {
        // Get only top-level comments (level 0, no parent)
        return this.findAll({ postId, level: 0, parentCommentId: null }, { sortBy: 'createdAt', order: 'asc' }, pagination);
    }
    async findReplies(parentCommentId, pagination) {
        return this.findAll({ parentCommentId }, { sortBy: 'createdAt', order: 'asc' }, pagination);
    }
    async findThread(parentCommentId) {
        try {
            // Get all comments in the thread (parent + all nested replies)
            const comments = await Comment_1.Comment.find({
                $or: [
                    { _id: parentCommentId },
                    { parentCommentId }
                ]
            })
                .sort({ createdAt: 1 })
                .populate('userId', 'userName email avatar')
                .lean();
            return comments.map(comment => this.toDomainEntity(comment));
        }
        catch (error) {
            logger_1.logger.error('Error finding thread:', error);
            throw new Error('Lỗi khi tìm thread bình luận');
        }
    }
    async findByUserId(userId, pagination) {
        return this.findAll({ userId }, { sortBy: 'createdAt', order: 'desc' }, pagination);
    }
    async toggleLike(commentId, userId) {
        try {
            const comment = await Comment_1.Comment.findById(commentId);
            if (!comment) {
                throw new Error('Không tìm thấy bình luận');
            }
            const userIdObj = userId;
            const likeIndex = comment.likes.findIndex(id => String(id) === String(userId));
            if (likeIndex > -1) {
                // Unlike
                comment.likes.splice(likeIndex, 1);
                comment.likesCount = Math.max(0, comment.likesCount - 1);
                await comment.save();
                return { liked: false, likesCount: comment.likesCount };
            }
            else {
                // Like
                comment.likes.push(userIdObj);
                comment.likesCount += 1;
                await comment.save();
                return { liked: true, likesCount: comment.likesCount };
            }
        }
        catch (error) {
            logger_1.logger.error('Error toggling like:', error);
            throw new Error('Lỗi khi toggle like');
        }
    }
    async addLike(commentId, userId) {
        try {
            const updated = await Comment_1.Comment.findByIdAndUpdate(commentId, {
                $addToSet: { likes: userId },
                $inc: { likesCount: 1 }
            }, { new: true })
                .populate('userId', 'userName email avatar')
                .lean();
            if (!updated)
                return null;
            return this.toDomainEntity(updated);
        }
        catch (error) {
            logger_1.logger.error('Error adding like:', error);
            throw new Error('Lỗi khi thêm like');
        }
    }
    async removeLike(commentId, userId) {
        try {
            const updated = await Comment_1.Comment.findByIdAndUpdate(commentId, {
                $pull: { likes: userId },
                $inc: { likesCount: -1 }
            }, { new: true })
                .populate('userId', 'userName email avatar')
                .lean();
            if (!updated)
                return null;
            return this.toDomainEntity(updated);
        }
        catch (error) {
            logger_1.logger.error('Error removing like:', error);
            throw new Error('Lỗi khi xóa like');
        }
    }
    async incrementRepliesCount(commentId) {
        try {
            const updated = await Comment_1.Comment.findByIdAndUpdate(commentId, { $inc: { repliesCount: 1 } }, { new: true })
                .populate('userId', 'userName email avatar')
                .lean();
            if (!updated)
                return null;
            return this.toDomainEntity(updated);
        }
        catch (error) {
            logger_1.logger.error('Error incrementing replies count:', error);
            throw new Error('Lỗi khi tăng replies count');
        }
    }
    async decrementRepliesCount(commentId) {
        try {
            const updated = await Comment_1.Comment.findByIdAndUpdate(commentId, { $inc: { repliesCount: -1 } }, { new: true })
                .populate('userId', 'userName email avatar')
                .lean();
            if (!updated)
                return null;
            return this.toDomainEntity(updated);
        }
        catch (error) {
            logger_1.logger.error('Error decrementing replies count:', error);
            throw new Error('Lỗi khi giảm replies count');
        }
    }
    async findByIdWithUser(id) {
        return this.findById(id);
    }
    async findByPostIdWithNested(postId, pagination) {
        try {
            const page = pagination?.page || 1;
            const limit = pagination?.limit || 20;
            const skip = (page - 1) * limit;
            // Get top-level comments with pagination
            const [topLevelComments, total] = await Promise.all([
                Comment_1.Comment.find({ postId, level: 0, parentCommentId: null })
                    .sort({ createdAt: 1 })
                    .skip(skip)
                    .limit(limit)
                    .populate('userId', 'userName email avatar')
                    .populate('mentionedUserId', 'userName email avatar')
                    .lean(),
                Comment_1.Comment.countDocuments({ postId, level: 0, parentCommentId: null })
            ]);
            // Get all replies for this post (all depths). We'll assemble the nested tree in the presentation layer.
            const replies = await Comment_1.Comment.find({ postId, parentCommentId: { $ne: null } })
                .sort({ createdAt: 1 })
                .populate('userId', 'userName email avatar')
                .populate('mentionedUserId', 'userName email avatar')
                .lean();
            // Combine top-level comments with all replies (flat list). Presentation will build the nested structure.
            const allComments = [...topLevelComments, ...replies];
            const totalPages = Math.ceil(total / limit);
            return {
                comments: allComments.map(comment => this.toDomainEntity(comment)),
                total,
                page,
                limit,
                totalPages,
                hasMore: page < totalPages
            };
        }
        catch (error) {
            logger_1.logger.error('Error finding comments with nested:', error);
            throw new Error('Lỗi khi tìm bình luận có cấu trúc lồng nhau');
        }
    }
    async countByPostId(postId) {
        return this.count({ postId });
    }
    async countReplies(commentId) {
        return this.count({ parentCommentId: commentId });
    }
    async getRecentByPostId(postId, limit = 3) {
        try {
            const comments = await Comment_1.Comment.find({ postId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate('userId', 'userName email avatar')
                .lean();
            return comments.map(comment => this.toDomainEntity(comment));
        }
        catch (error) {
            logger_1.logger.error('Error finding recent comments:', error);
            throw new Error('Lỗi khi tìm bình luận gần đây');
        }
    }
    async getMostLikedByPostId(postId, limit = 3) {
        try {
            const comments = await Comment_1.Comment.find({ postId })
                .sort({ likesCount: -1 })
                .limit(limit)
                .populate('userId', 'userName email avatar')
                .lean();
            return comments.map(comment => this.toDomainEntity(comment));
        }
        catch (error) {
            logger_1.logger.error('Error finding most liked comments:', error);
            throw new Error('Lỗi khi tìm bình luận được thích nhiều nhất');
        }
    }
    async deleteByPostId(postId) {
        try {
            await Comment_1.Comment.deleteMany({ postId });
        }
        catch (error) {
            logger_1.logger.error('Error deleting comments by post ID:', error);
            throw new Error('Lỗi khi xóa bình luận theo post ID');
        }
    }
    async deleteByUserId(userId) {
        try {
            const result = await Comment_1.Comment.deleteMany({ userId });
            return result.deletedCount || 0;
        }
        catch (error) {
            logger_1.logger.error('Error deleting comments by user ID:', error);
            throw new Error('Lỗi khi xóa bình luận theo user ID');
        }
    }
    async deleteWithReplies(commentId) {
        try {
            // First, find all replies (including nested)
            const comment = await Comment_1.Comment.findById(commentId);
            if (!comment)
                return 0;
            // Delete all replies recursively
            const replies = await Comment_1.Comment.find({ parentCommentId: commentId });
            let deletedCount = 0;
            for (const reply of replies) {
                deletedCount += await this.deleteWithReplies(String(reply._id));
            }
            // Delete the comment itself
            await Comment_1.Comment.findByIdAndDelete(commentId);
            deletedCount += 1;
            return deletedCount;
        }
        catch (error) {
            logger_1.logger.error('Error deleting comment with replies:', error);
            throw new Error('Lỗi khi xóa bình luận và replies');
        }
    }
    async countUserComments(userId) {
        return this.count({ userId });
    }
}
exports.CommentRepository = CommentRepository;
