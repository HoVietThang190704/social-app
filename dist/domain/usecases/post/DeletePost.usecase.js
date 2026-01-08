"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletePostUseCase = void 0;
class DeletePostUseCase {
    constructor(postRepository, commentRepository, elasticsearchService) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.elasticsearchService = elasticsearchService;
    }
    async execute(dto) {
        // Validate input
        if (!dto.postId || dto.postId.trim().length === 0) {
            throw new Error('Post ID không được để trống');
        }
        if (!dto.userId || dto.userId.trim().length === 0) {
            throw new Error('User ID không được để trống');
        }
        // Get existing post
        const existingPost = await this.postRepository.findById(dto.postId);
        if (!existingPost) {
            throw new Error('Không tìm thấy bài viết');
        }
        // Check authorization
        if (!existingPost.canBeDeletedBy(dto.userId, dto.isAdmin)) {
            throw new Error('Bạn không có quyền xóa bài viết này');
        }
        // Delete all comments for this post (cascade delete)
        await this.commentRepository.deleteByPostId(dto.postId);
        // Delete the post
        const deleted = await this.postRepository.delete(dto.postId);
        if (!deleted) {
            throw new Error('Không thể xóa bài viết');
        }
        await this.elasticsearchService?.removePost(dto.postId);
        return true;
    }
}
exports.DeletePostUseCase = DeletePostUseCase;
