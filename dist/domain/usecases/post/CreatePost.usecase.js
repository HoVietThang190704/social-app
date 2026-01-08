"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePostUseCase = void 0;
class CreatePostUseCase {
    constructor(postRepository, elasticsearchService) {
        this.postRepository = postRepository;
        this.elasticsearchService = elasticsearchService;
    }
    async execute(dto) {
        if (!dto.userId || dto.userId.trim().length === 0) {
            throw new Error('User ID không được để trống');
        }
        const hasContent = dto.content && dto.content.trim().length > 0;
        const hasImages = dto.images && dto.images.length > 0;
        if (!hasContent && !hasImages) {
            throw new Error('Bài viết phải có nội dung hoặc hình ảnh');
        }
        if (dto.content && dto.content.length > 10000) {
            throw new Error('Nội dung bài viết không được vượt quá 10,000 ký tự');
        }
        if (dto.images && dto.images.length > 10) {
            throw new Error('Số lượng hình ảnh không được vượt quá 10');
        }
        if (dto.images && dto.cloudinaryPublicIds && dto.images.length !== dto.cloudinaryPublicIds.length) {
            throw new Error('Số lượng hình ảnh và public IDs không khớp');
        }
        // Create post entity
        const postData = {
            userId: dto.userId,
            content: dto.content ? dto.content.trim() : '',
            images: dto.images || [],
            cloudinaryPublicIds: dto.cloudinaryPublicIds || [],
            likes: [],
            likesCount: 0,
            commentsCount: 0,
            sharesCount: 0,
            visibility: dto.visibility || 'public',
            isEdited: false,
        };
        // Save to repository
        const post = await this.postRepository.create(postData);
        await this.elasticsearchService?.indexPost(post);
        return post;
    }
}
exports.CreatePostUseCase = CreatePostUseCase;
