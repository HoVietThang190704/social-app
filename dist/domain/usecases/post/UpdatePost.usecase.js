"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePostUseCase = void 0;
class UpdatePostUseCase {
    constructor(postRepository, elasticsearchService) {
        this.postRepository = postRepository;
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
        if (!existingPost.canBeEditedBy(dto.userId)) {
            throw new Error('Bạn không có quyền chỉnh sửa bài viết này');
        }
        // Validate content
        if (dto.content !== undefined) {
            if (dto.content.trim().length === 0) {
                throw new Error('Nội dung bài viết không được để trống');
            }
            if (dto.content.length > 10000) {
                throw new Error('Nội dung bài viết không được vượt quá 10,000 ký tự');
            }
        }
        // Validate images
        if (dto.images && dto.images.length > 10) {
            throw new Error('Số lượng hình ảnh không được vượt quá 10');
        }
        if (dto.images && dto.cloudinaryPublicIds && dto.images.length !== dto.cloudinaryPublicIds.length) {
            throw new Error('Số lượng hình ảnh và public IDs không khớp');
        }
        // Prepare update data
        const updateData = {
            isEdited: true,
            editedAt: new Date(),
        };
        if (dto.content !== undefined) {
            updateData.content = dto.content.trim();
        }
        if (dto.images !== undefined) {
            updateData.images = dto.images;
            updateData.cloudinaryPublicIds = dto.cloudinaryPublicIds || [];
        }
        if (dto.visibility !== undefined) {
            updateData.visibility = dto.visibility;
        }
        // Update post
        const updatedPost = await this.postRepository.update(dto.postId, updateData);
        if (!updatedPost) {
            throw new Error('Không thể cập nhật bài viết');
        }
        await this.elasticsearchService?.indexPost(updatedPost);
        return updatedPost;
    }
}
exports.UpdatePostUseCase = UpdatePostUseCase;
