"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostController = void 0;
const Post_dto_1 = require("../dto/post/Post.dto");
const ShareInfo_dto_1 = require("../dto/share/ShareInfo.dto");
const logger_1 = require("../../shared/utils/logger");
const FriendService_1 = require("../../services/friend/FriendService");
/**
 * Post Controller - HTTP Layer
 * Handles HTTP requests and delegates to use cases
 */
class PostController {
    constructor(createPostUseCase, updatePostUseCase, deletePostUseCase, getPostByIdUseCase, getPostsFeedUseCase, getUserPostsUseCase, getPublicPostsUseCase, searchPostsUseCase, getTrendingPostsUseCase, toggleLikePostUseCase, sharePostUseCase, getPostShareInfoUseCase) {
        this.createPostUseCase = createPostUseCase;
        this.updatePostUseCase = updatePostUseCase;
        this.deletePostUseCase = deletePostUseCase;
        this.getPostByIdUseCase = getPostByIdUseCase;
        this.getPostsFeedUseCase = getPostsFeedUseCase;
        this.getUserPostsUseCase = getUserPostsUseCase;
        this.getPublicPostsUseCase = getPublicPostsUseCase;
        this.searchPostsUseCase = searchPostsUseCase;
        this.getTrendingPostsUseCase = getTrendingPostsUseCase;
        this.toggleLikePostUseCase = toggleLikePostUseCase;
        this.sharePostUseCase = sharePostUseCase;
        this.getPostShareInfoUseCase = getPostShareInfoUseCase;
    }
    /**
     * Helper: Map post with user data
     */
    mapPostWithUser(post, currentUserId) {
        return Post_dto_1.PostMapper.toDTO(post, currentUserId, post.user ? { user: post.user } : undefined);
    }
    /**
     * Helper: Map paginated posts with user data
     */
    mapPaginatedPosts(result, currentUserId) {
        return {
            posts: result.posts.map((post) => this.mapPostWithUser(post, currentUserId)),
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
                hasMore: result.hasMore
            }
        };
    }
    /**
     * POST /api/posts
     * Create a new post
     */
    async createPost(req, res) {
        try {
            const userId = req.user?.id; // From auth middleware
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
                return;
            }
            const data = req.body;
            const post = await this.createPostUseCase.execute({
                userId,
                content: data.content,
                images: data.images,
                cloudinaryPublicIds: data.cloudinaryPublicIds,
                videos: data.videos,
                videoPublicIds: data.videoPublicIds,
                visibility: data.visibility
            });
            res.status(201).json({
                success: true,
                message: 'Tạo bài viết thành công',
                data: this.mapPostWithUser(post, userId)
            });
        }
        catch (error) {
            logger_1.logger.error('Error creating post:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Lỗi khi tạo bài viết'
            });
        }
    }
    /**
     * PUT /api/posts/:postId
     * Update a post
     */
    async updatePost(req, res) {
        try {
            const userId = req.user?.id;
            const postId = req.params.postId;
            const data = req.body;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
                return;
            }
            const post = await this.updatePostUseCase.execute({
                postId,
                userId,
                ...data
            });
            res.status(200).json({
                success: true,
                message: 'Cập nhật bài viết thành công',
                data: Post_dto_1.PostMapper.toDTO(post, userId)
            });
        }
        catch (error) {
            logger_1.logger.error('Error updating post:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Lỗi khi cập nhật bài viết'
            });
        }
    }
    /**
     * DELETE /api/posts/:postId
     * Delete a post
     */
    async deletePost(req, res) {
        try {
            const userId = req.user?.id;
            const isAdmin = req.user?.role === 'admin';
            const postId = req.params.postId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
                return;
            }
            await this.deletePostUseCase.execute({
                postId,
                userId,
                isAdmin
            });
            res.status(200).json({
                success: true,
                message: 'Xóa bài viết thành công'
            });
        }
        catch (error) {
            logger_1.logger.error('Error deleting post:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Lỗi khi xóa bài viết'
            });
        }
    }
    /**
     * GET /api/posts/:postId
     * Get post by ID
     */
    async getPostById(req, res) {
        try {
            const userId = req.user?.id;
            const postId = req.params.postId;
            const post = await this.getPostByIdUseCase.execute({
                postId,
                userId
            });
            res.status(200).json({
                success: true,
                data: Post_dto_1.PostMapper.toDTO(post, userId, post.user ? { user: post.user } : undefined)
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting post:', error);
            res.status(404).json({
                success: false,
                message: error.message || 'Không tìm thấy bài viết'
            });
        }
    }
    /**
     * GET /api/posts/feed
     * Get posts feed for current user
     */
    async getFeed(req, res) {
        try {
            const userId = req.user?.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
                return;
            }
            // Get user's friends IDs from database
            const friendIds = await FriendService_1.friendService.getFriendIds(userId);
            const result = await this.getPostsFeedUseCase.execute(userId, friendIds, { page, limit });
            res.status(200).json({
                success: true,
                data: this.mapPaginatedPosts(result, userId)
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting feed:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Lỗi khi lấy feed'
            });
        }
    }
    /**
     * GET /api/posts/user/:userId
     * Get posts by user
     */
    async getUserPosts(req, res) {
        try {
            const currentUserId = req.user?.id;
            const targetUserId = req.params.userId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await this.getUserPostsUseCase.execute(targetUserId, { page, limit });
            res.status(200).json({
                success: true,
                data: Post_dto_1.PostMapper.toPaginatedDTO(result.posts, result.total, result.page, result.limit, result.totalPages, result.hasMore, currentUserId)
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting user posts:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Lỗi khi lấy bài viết người dùng'
            });
        }
    }
    /**
     * GET /api/posts/public
     * Get all public posts
     */
    async getPublicPosts(req, res) {
        try {
            const currentUserId = req.user?.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await this.getPublicPostsUseCase.execute({ page, limit });
            res.status(200).json({
                success: true,
                data: Post_dto_1.PostMapper.toPaginatedDTO(result.posts, result.total, result.page, result.limit, result.totalPages, result.hasMore, currentUserId)
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting public posts:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Lỗi khi lấy bài viết công khai'
            });
        }
    }
    /**
     * GET /api/posts/search
     * Search posts
     */
    async searchPosts(req, res) {
        try {
            const currentUserId = req.user?.id;
            const query = req.query.q;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await this.searchPostsUseCase.execute(query, { page, limit });
            res.status(200).json({
                success: true,
                data: Post_dto_1.PostMapper.toPaginatedDTO(result.posts, result.total, result.page, result.limit, result.totalPages, result.hasMore, currentUserId)
            });
        }
        catch (error) {
            logger_1.logger.error('Error searching posts:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Lỗi khi tìm kiếm bài viết'
            });
        }
    }
    /**
     * GET /api/posts/trending
     * Get trending posts
     */
    async getTrendingPosts(req, res) {
        try {
            const currentUserId = req.user?.id;
            const limit = parseInt(req.query.limit) || 10;
            const timeWindow = parseInt(req.query.timeWindow) || 24;
            const posts = await this.getTrendingPostsUseCase.execute(limit, timeWindow);
            res.status(200).json({
                success: true,
                data: Post_dto_1.PostMapper.toDTOs(posts, currentUserId)
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting trending posts:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Lỗi khi lấy bài viết trending'
            });
        }
    }
    /**
     * POST /api/posts/:postId/like
     * Toggle like on a post
     */
    async toggleLike(req, res) {
        try {
            const userId = req.user?.id;
            const postId = req.params.postId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
                return;
            }
            const result = await this.toggleLikePostUseCase.execute({
                postId,
                userId
            });
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.logger.error('Error toggling like:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Lỗi khi like/unlike bài viết'
            });
        }
    }
    /**
     * POST /api/posts/:postId/share
     * Share a post
     */
    async sharePost(req, res) {
        try {
            const userId = req.user?.id;
            const originalPostId = req.params.postId;
            const data = req.body;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
                return;
            }
            const post = await this.sharePostUseCase.execute({
                originalPostId,
                userId,
                content: data.content
            });
            res.status(201).json({
                success: true,
                message: 'Chia sẻ bài viết thành công',
                data: this.mapPostWithUser(post, userId)
            });
        }
        catch (error) {
            logger_1.logger.error('Error sharing post:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Lỗi khi chia sẻ bài viết'
            });
        }
    }
    /**
     * GET /api/posts/:postId/share-info
     * Build share metadata for a public post
     */
    async getShareInfo(req, res) {
        try {
            const postId = req.params.postId;
            const locale = req.query.locale || 'vi';
            const shareInfo = await this.getPostShareInfoUseCase.execute({
                postId,
                locale
            });
            res.status(200).json({
                success: true,
                data: ShareInfo_dto_1.ShareInfoMapper.toDTO(shareInfo)
            });
        }
        catch (error) {
            logger_1.logger.error('Error generating post share info:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Không thể tạo liên kết chia sẻ cho bài viết'
            });
        }
    }
}
exports.PostController = PostController;
