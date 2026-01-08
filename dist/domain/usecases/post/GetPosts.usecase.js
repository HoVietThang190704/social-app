"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTrendingPostsUseCase = exports.SearchPostsUseCase = exports.GetPublicPostsUseCase = exports.GetUserPostsUseCase = exports.GetPostsFeedUseCase = exports.GetPostByIdUseCase = void 0;
const logger_1 = require("../../../shared/utils/logger");
class GetPostByIdUseCase {
    constructor(postRepository) {
        this.postRepository = postRepository;
    }
    async execute(dto) {
        // Validate input
        if (!dto.postId || dto.postId.trim().length === 0) {
            throw new Error('Post ID không hợp lệ');
        }
        // Get post from repository
        const post = await this.postRepository.findByIdWithUser(dto.postId);
        if (!post) {
            throw new Error('Không tìm thấy bài viết');
        }
        // Check if user can view this post
        if (dto.userId && !post.canBeViewedBy(dto.userId)) {
            throw new Error('Bạn không có quyền xem bài viết này');
        }
        return post;
    }
}
exports.GetPostByIdUseCase = GetPostByIdUseCase;
/**
 * Use Case: Get Posts Feed
 */
class GetPostsFeedUseCase {
    constructor(postRepository) {
        this.postRepository = postRepository;
    }
    async execute(userId, friendIds = [], pagination) {
        // Get posts for user feed (public + friends' posts)
        const posts = await this.postRepository.findFeedPosts(userId, friendIds, pagination);
        return posts;
    }
}
exports.GetPostsFeedUseCase = GetPostsFeedUseCase;
/**
 * Use Case: Get User Posts
 */
class GetUserPostsUseCase {
    constructor(postRepository) {
        this.postRepository = postRepository;
    }
    async execute(userId, pagination) {
        // Get posts by user ID
        const posts = await this.postRepository.findByUserId(userId, pagination);
        return posts;
    }
}
exports.GetUserPostsUseCase = GetUserPostsUseCase;
/**
 * Use Case: Get Public Posts
 */
class GetPublicPostsUseCase {
    constructor(postRepository) {
        this.postRepository = postRepository;
    }
    async execute(pagination) {
        // Get all public posts
        const posts = await this.postRepository.findPublicPosts(pagination);
        return posts;
    }
}
exports.GetPublicPostsUseCase = GetPublicPostsUseCase;
/**
 * Use Case: Search Posts
 */
class SearchPostsUseCase {
    constructor(postRepository, elasticsearchService) {
        this.postRepository = postRepository;
        this.elasticsearchService = elasticsearchService;
    }
    async execute(query, pagination) {
        // Validate input
        if (!query || query.trim().length === 0) {
            throw new Error('Từ khóa tìm kiếm không được để trống');
        }
        if (query.trim().length < 1) {
            throw new Error('Từ khóa tìm kiếm phải có ít nhất 1 ký tự');
        }
        if (this.elasticsearchService?.isEnabled()) {
            try {
                const result = await this.elasticsearchService.searchPosts(query, {
                    page: pagination?.page,
                    limit: pagination?.limit
                });
                return {
                    posts: result.items,
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                    hasMore: result.total > result.limit * result.page
                };
            }
            catch (error) {
                logger_1.logger.warn('[SearchPostsUseCase] Elasticsearch search failed, falling back to Mongo search', error);
            }
        }
        return this.postRepository.search(query, pagination);
    }
}
exports.SearchPostsUseCase = SearchPostsUseCase;
/**
 * Use Case: Get Trending Posts
 */
class GetTrendingPostsUseCase {
    constructor(postRepository) {
        this.postRepository = postRepository;
    }
    async execute(limit = 10, timeWindow = 24) {
        // Get trending posts
        const posts = await this.postRepository.findTrending(limit, timeWindow);
        return posts;
    }
}
exports.GetTrendingPostsUseCase = GetTrendingPostsUseCase;
