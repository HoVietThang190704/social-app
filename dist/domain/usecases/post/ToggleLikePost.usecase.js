"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleLikePostUseCase = void 0;
class ToggleLikePostUseCase {
    constructor(postRepository) {
        this.postRepository = postRepository;
    }
    async execute(dto) {
        if (!dto.postId || dto.postId.trim().length === 0) {
            throw new Error('Post ID không được để trống');
        }
        if (!dto.userId || dto.userId.trim().length === 0) {
            throw new Error('User ID không được để trống');
        }
        // Check if post exists
        const post = await this.postRepository.findById(dto.postId);
        if (!post) {
            throw new Error('Không tìm thấy bài viết');
        }
        // Toggle like
        const result = await this.postRepository.toggleLike(dto.postId, dto.userId);
        return result;
    }
}
exports.ToggleLikePostUseCase = ToggleLikePostUseCase;
