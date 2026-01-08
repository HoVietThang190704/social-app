"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PostController_1 = require("../presentation/controllers/PostController");
const PostRepository_1 = require("../data/repositories/PostRepository");
const post_1 = require("../domain/usecases/post");
const auth_middleware_1 = require("../shared/middleware/auth.middleware");
const validate_1 = require("../shared/middleware/validate");
const post_schema_1 = require("../shared/validation/post.schema");
const search_1 = require("../services/search");
const share_1 = require("../services/share");
const config_1 = require("../config");
const router = (0, express_1.Router)();
// Initialize repository and use cases
const postRepository = new PostRepository_1.PostRepository();
const commentRepository = new (require('../data/repositories/CommentRepository').CommentRepository)();
const createPostUseCase = new post_1.CreatePostUseCase(postRepository, search_1.elasticsearchService);
const updatePostUseCase = new post_1.UpdatePostUseCase(postRepository, search_1.elasticsearchService);
const deletePostUseCase = new post_1.DeletePostUseCase(postRepository, commentRepository, search_1.elasticsearchService);
const getPostByIdUseCase = new post_1.GetPostByIdUseCase(postRepository);
const getPostsFeedUseCase = new post_1.GetPostsFeedUseCase(postRepository);
const getUserPostsUseCase = new post_1.GetUserPostsUseCase(postRepository);
const getPublicPostsUseCase = new post_1.GetPublicPostsUseCase(postRepository);
const searchPostsUseCase = new post_1.SearchPostsUseCase(postRepository, search_1.elasticsearchService);
const getTrendingPostsUseCase = new post_1.GetTrendingPostsUseCase(postRepository);
const toggleLikePostUseCase = new post_1.ToggleLikePostUseCase(postRepository);
const sharePostUseCase = new post_1.SharePostUseCase(postRepository);
const getPostShareInfoUseCase = new post_1.GetPostShareInfoUseCase(postRepository, share_1.qrCodeService, config_1.config.FRONTEND_BASE_URL);
// Initialize controller
const postController = new PostController_1.PostController(createPostUseCase, updatePostUseCase, deletePostUseCase, getPostByIdUseCase, getPostsFeedUseCase, getUserPostsUseCase, getPublicPostsUseCase, searchPostsUseCase, getTrendingPostsUseCase, toggleLikePostUseCase, sharePostUseCase, getPostShareInfoUseCase);
// Routes - Specific routes MUST come before parameterized routes
/**
 * @swagger
 * /api/posts/feed/user:
 *   get:
 *     tags: [Posts]
 *     summary: Lấy feed bài viết của người dùng
 *     description: Lấy bài viết từ bạn bè và những người user theo dõi
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/feed/user', auth_middleware_1.authMiddleware, (req, res) => postController.getFeed(req, res));
/**
 * @swagger
 * /api/posts/feed/public:
 *   get:
 *     tags: [Posts]
 *     summary: Lấy bài viết công khai
 *     description: Lấy tất cả bài viết công khai (không cần đăng nhập)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/feed/public', (req, res) => postController.getPublicPosts(req, res));
/**
 * @swagger
 * /api/posts/search/query:
 *   get:
 *     tags: [Posts]
 *     summary: Tìm kiếm bài viết
 *     description: Tìm kiếm bài viết theo nội dung
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/search/query', (req, res) => postController.searchPosts(req, res));
/**
 * @swagger
 * /api/posts/trending/now:
 *   get:
 *     tags: [Posts]
 *     summary: Lấy bài viết xu hướng
 *     description: Lấy bài viết đang được quan tâm nhiều nhất
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/trending/now', (req, res) => postController.getTrendingPosts(req, res));
/**
 * @swagger
 * /api/posts/user/{userId}:
 *   get:
 *     tags: [Posts]
 *     summary: Lấy bài viết của user
 *     description: Lấy tất cả bài viết của một user cụ thể
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/user/:userId', (req, res) => postController.getUserPosts(req, res));
/**
 * @swagger
 * /api/posts:
 *   post:
 *     tags: [Posts]
 *     summary: Tạo bài viết mới
 *     description: Tạo một bài viết mới (cần đăng nhập)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Hôm nay mua rau tươi quá!"
 *                 description: Nội dung bài viết (bắt buộc nếu không có ảnh)
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://res.cloudinary.com/..."]
 *                 description: Mảng URL ảnh từ Cloudinary
 *               cloudinaryPublicIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["posts/abc123"]
 *                 description: Mảng public IDs của ảnh trên Cloudinary
 *               visibility:
 *                 type: string
 *                 enum: [public, private, friends]
 *                 default: public
 *     responses:
 *       201:
 *         description: Tạo bài viết thành công
 *       401:
 *         description: Chưa đăng nhập
 */
router.post('/', auth_middleware_1.authMiddleware, (0, validate_1.validate)(post_schema_1.createPostSchema), (req, res) => postController.createPost(req, res));
/**
 * @swagger
 * /api/posts/{postId}/share-info:
 *   get:
 *     tags: [Posts]
 *     summary: Lấy thông tin chia sẻ bài post
 *     description: Tạo liên kết và mã QR để chia sẻ bài post công khai
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *           default: vi
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Không thể tạo dữ liệu chia sẻ
 */
router.get('/:postId/share-info', (req, res) => postController.getShareInfo(req, res));
/**
 * @swagger
 * /api/posts/{postId}:
 *   get:
 *     tags: [Posts]
 *     summary: Lấy chi tiết bài post
 *     description: Lấy thông tin chi tiết của một bài post theo ID
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài post
 *     responses:
 *       200:
 *         description: Lấy bài post thành công
 *       404:
 *         description: Không tìm thấy bài post
 */
router.get('/:postId', (req, res) => postController.getPostById(req, res));
/**
 * @swagger
 * /api/posts/{postId}:
 *   put:
 *     tags: [Posts]
 *     summary: Cập nhật bài post
 *     description: Cập nhật nội dung hoặc ảnh của bài post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Nội dung bài post
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách URL ảnh
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       403:
 *         description: Không có quyền chỉnh sửa
 */
router.put('/:postId', auth_middleware_1.authMiddleware, (0, validate_1.validate)(post_schema_1.updatePostSchema), (req, res) => postController.updatePost(req, res));
/**
 * @swagger
 * /api/posts/{postId}:
 *   delete:
 *     tags: [Posts]
 *     summary: Xóa bài post
 *     description: Xóa một bài post (chỉ tác giả hoặc admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài post
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       403:
 *         description: Không có quyền xóa
 */
router.delete('/:postId', auth_middleware_1.authMiddleware, (req, res) => postController.deletePost(req, res));
/**
 * @swagger
 * /api/posts/{postId}/like:
 *   post:
 *     tags: [Posts]
 *     summary: Like/Unlike bài post
 *     description: Toggle trạng thái like của bài post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài post
 *     responses:
 *       200:
 *         description: Toggle like thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     isLiked:
 *                       type: boolean
 *                     likesCount:
 *                       type: number
 */
router.post('/:postId/like', auth_middleware_1.authMiddleware, (req, res) => postController.toggleLike(req, res));
/**
 * @swagger
 * /api/posts/{postId}/share:
 *   post:
 *     tags: [Posts]
 *     summary: Share bài post
 *     description: Chia sẻ một bài post (tạo bài mới với reference)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài post cần share
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Nội dung kèm theo khi share (optional)
 *     responses:
 *       200:
 *         description: Share thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: Bài post mới được tạo
 */
router.post('/:postId/share', auth_middleware_1.authMiddleware, (0, validate_1.validate)(post_schema_1.sharePostSchema), (req, res) => postController.sharePost(req, res));
exports.default = router;
