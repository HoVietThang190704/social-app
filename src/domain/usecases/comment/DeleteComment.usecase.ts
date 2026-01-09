import { ICommentRepository } from '../../repositories/ICommentRepository';
import { IPostRepository } from '../../repositories/IPostRepository';

export interface DeleteCommentDTO {
  commentId: string;
  userId: string;
  isAdmin?: boolean;
}

export class DeleteCommentUseCase {
  constructor(
    private readonly commentRepository: ICommentRepository,
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(dto: DeleteCommentDTO): Promise<{ deleted: number }> {
    if (!dto.commentId || dto.commentId.trim().length === 0) {
      throw new Error('Comment ID không được để trống');
    }

    if (!dto.userId || dto.userId.trim().length === 0) {
      throw new Error('User ID không được để trống');
    }

    const existing = await this.commentRepository.findById(dto.commentId);
    if (!existing) {
      throw new Error('Không tìm thấy bình luận');
    }

    const isOwner = existing.userId === dto.userId;
    if (!isOwner && !dto.isAdmin) {
      throw new Error('Bạn không có quyền xóa bình luận này');
    }

    const totalDeleted = await this.commentRepository.deleteWithReplies(dto.commentId);

    if (existing.parentCommentId) {
      await this.commentRepository.decrementRepliesCount(existing.parentCommentId);
    }

    await this.postRepository.adjustCommentsCount(existing.postId, -totalDeleted);

    return { deleted: totalDeleted };
  }
}
