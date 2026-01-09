import { ICommentRepository } from '../../repositories/ICommentRepository';

export interface ToggleLikeCommentDTO {
  commentId: string;
  userId: string;
}

export class ToggleLikeCommentUseCase {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async execute(dto: ToggleLikeCommentDTO): Promise<{ liked: boolean; likesCount: number }> {
    if (!dto.commentId || dto.commentId.trim().length === 0) {
      throw new Error('Comment ID không được để trống');
    }

    if (!dto.userId || dto.userId.trim().length === 0) {
      throw new Error('User ID không được để trống');
    }

    return this.commentRepository.toggleLike(dto.commentId, dto.userId);
  }
}
