import { Router } from 'express';
import { CommentRepository } from '../data/repositories/CommentRepository';
import { PostRepository } from '../data/repositories/PostRepository';
import { CreateCommentUseCase, GetCommentsUseCase, ToggleLikeCommentUseCase, DeleteCommentUseCase } from '../domain/usecases/comment';
import { CommentController } from '../presentation/controllers/CommentController';
import { authMiddleware, optionalAuthMiddleware } from '../shared/middleware/auth.middleware';
import { validate } from '../shared/middleware/validate';
import { createCommentSchema, replyCommentSchema } from '../shared/validation/comment.schema';

const router = Router();

const commentRepository = new CommentRepository();
const postRepository = new PostRepository();

const createCommentUseCase = new CreateCommentUseCase(commentRepository, postRepository);
const getCommentsUseCase = new GetCommentsUseCase(commentRepository);
const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase(commentRepository);
const deleteCommentUseCase = new DeleteCommentUseCase(commentRepository, postRepository);

const commentController = new CommentController(
  createCommentUseCase,
  getCommentsUseCase,
  toggleLikeCommentUseCase,
  deleteCommentUseCase,
);

/**
 * @swagger
 * /api/comments/post/{postId}:
 *   get:
 *     tags: [Comments]
 *     summary: Lấy danh sách bình luận (3 tầng)
 *     parameters:
 *       - in: path
 *         name: postId
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
router.get('/post/:postId', optionalAuthMiddleware, (req, res) => commentController.getComments(req, res));

/**
 * @swagger
 * /api/comments/post/{postId}:
 *   post:
 *     tags: [Comments]
 *     summary: Thêm bình luận mới cho bài viết
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               mentionedUserId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo bình luận thành công
 */
router.post('/post/:postId', authMiddleware, validate(createCommentSchema), (req, res) => commentController.createComment(req, res));

/**
 * @swagger
 * /api/comments/{commentId}/reply:
 *   post:
 *     tags: [Comments]
 *     summary: Trả lời một bình luận (tối đa 3 cấp)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               mentionedUserId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Trả lời thành công
 */
router.post('/:commentId/reply', authMiddleware, validate(replyCommentSchema), (req, res) => commentController.replyComment(req, res));

/**
 * @swagger
 * /api/comments/{commentId}/like:
 *   post:
 *     tags: [Comments]
 *     summary: Like/Unlike bình luận
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post('/:commentId/like', authMiddleware, (req, res) => commentController.toggleLike(req, res));

/**
 * @swagger
 * /api/comments/{commentId}:
 *   delete:
 *     tags: [Comments]
 *     summary: Xóa bình luận (bao gồm các phản hồi con)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/:commentId', authMiddleware, (req, res) => commentController.deleteComment(req, res));

export default router;
