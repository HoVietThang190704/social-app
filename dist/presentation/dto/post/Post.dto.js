"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostMapper = void 0;
/**
 * Post Mapper - Convert between Entity and DTO
 */
class PostMapper {
    /**
     * Convert Post Entity to DTO
     */
    static toDTO(entity, currentUserId, populatedData) {
        return {
            id: entity.id,
            userId: entity.userId,
            // prefer explicit populatedData passed from controller, else fall back to any populated
            // user attached directly on the entity by the repository
            user: populatedData?.user ?? entity.user,
            content: entity.content,
            images: entity.images,
            likesCount: entity.likesCount,
            commentsCount: entity.commentsCount,
            sharesCount: entity.sharesCount,
            isLiked: currentUserId ? entity.isLikedBy(currentUserId) : undefined,
            visibility: entity.visibility,
            isEdited: entity.isEdited,
            editedAt: entity.editedAt?.toISOString(),
            originalPostId: entity.originalPostId,
            // originalPost/sharedBy may be provided via populatedData or attached on entity
            originalPost: populatedData?.originalPost ? this.toDTO(populatedData.originalPost) : entity.originalPost ? this.toDTO(entity.originalPost) : undefined,
            sharedBy: populatedData?.sharedBy ?? entity.sharedBy,
            createdAt: entity.createdAt.toISOString(),
            updatedAt: entity.updatedAt.toISOString()
        };
    }
    /**
     * Convert multiple Post Entities to DTOs
     */
    static toDTOs(entities, currentUserId) {
        return entities.map(entity => this.toDTO(entity, currentUserId));
    }
    /**
     * Convert to Paginated DTO
     */
    static toPaginatedDTO(entities, total, page, limit, totalPages, hasMore, currentUserId) {
        return {
            posts: this.toDTOs(entities, currentUserId),
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasMore
            }
        };
    }
}
exports.PostMapper = PostMapper;
