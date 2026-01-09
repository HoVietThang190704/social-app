import { Request, Response } from 'express';
import { CreateCommentUseCase } from '../../domain/usecases/comment/CreateComment.usecase';
import { GetCommentsUseCase } from '../../domain/usecases/comment/GetComments.usecase';
import { ToggleLikeCommentUseCase } from '../../domain/usecases/comment/ToggleLikeComment.usecase';
import { DeleteCommentUseCase } from '../../domain/usecases/comment/DeleteComment.usecase';
import { CommentMapper } from '../dto/comment/Comment.dto';
import { logger } from '../../shared/utils/logger';

export class CommentController {
  constructor(
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly getCommentsUseCase: GetCommentsUseCase,
    private readonly toggleLikeCommentUseCase: ToggleLikeCommentUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase,
  ) {}

  async getComments(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params as { postId: string };
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const currentUserId = (req as any).user?.id;

      const result = await this.getCommentsUseCase.execute({ postId, page, limit });
      const comments = CommentMapper.toDTOs(result.comments, currentUserId);

      res.status(200).json({
        success: true,
        data: {
          comments,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
            hasMore: result.hasMore,
          },
        },
      });
    } catch (error: any) {
      logger.error('Error getting comments:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi lấy danh sách bình luận',
      });
    }
  }

  async createComment(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { postId } = req.params as { postId: string };
      const { content, images, mentionedUserId } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const comment = await this.createCommentUseCase.execute({
        postId,
        userId,
        content,
        images,
        mentionedUserId,
      });

      res.status(201).json({
        success: true,
        message: 'Tạo bình luận thành công',
        data: CommentMapper.toDTO(comment, userId),
      });
    } catch (error: any) {
      logger.error('Error creating comment:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi tạo bình luận',
      });
    }
  }

  async replyComment(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { commentId } = req.params as { commentId: string };
      const { content, images, mentionedUserId } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const reply = await this.createCommentUseCase.execute({
        userId,
        parentCommentId: commentId,
        content,
        images,
        mentionedUserId,
      });

      res.status(201).json({
        success: true,
        message: 'Trả lời bình luận thành công',
        data: CommentMapper.toDTO(reply, userId),
      });
    } catch (error: any) {
      logger.error('Error replying comment:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi trả lời bình luận',
      });
    }
  }

  async toggleLike(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { commentId } = req.params as { commentId: string };

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const result = await this.toggleLikeCommentUseCase.execute({ commentId, userId });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Error toggling like comment:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi like bình luận',
      });
    }
  }

  async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const isAdmin = (req as any).user?.role === 'admin';
      const { commentId } = req.params as { commentId: string };

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const result = await this.deleteCommentUseCase.execute({
        commentId,
        userId,
        isAdmin,
      });

      res.status(200).json({
        success: true,
        message: 'Xóa bình luận thành công',
        data: result,
      });
    } catch (error: any) {
      logger.error('Error deleting comment:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi xóa bình luận',
      });
    }
  }
}
