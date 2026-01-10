import { ICommentRepository } from '../../repositories/ICommentRepository';
import { IPostRepository } from '../../repositories/IPostRepository';
import { CommentEntity } from '../../entities/Comment.entity';

export interface CreateCommentDTO {
  postId?: string;
  userId: string;
  content: string;
  images?: string[];
  cloudinaryPublicIds?: string[];
  parentCommentId?: string | null;
  mentionedUserId?: string;
}

export class CreateCommentUseCase {
  constructor(
    private readonly commentRepository: ICommentRepository,
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(dto: CreateCommentDTO): Promise<CommentEntity> {
    if (!dto.userId || dto.userId.trim().length === 0) {
      throw new Error('User ID không được để trống');
    }

    let targetPostId = dto.postId?.trim();

    const trimmedContent = dto.content?.trim() ?? '';
    const hasContent = trimmedContent.length > 0;
    const hasImages = dto.images && dto.images.length > 0;

    if (!hasContent && !hasImages) {
      throw new Error('Bình luận cần có nội dung hoặc hình ảnh');
    }

    if (trimmedContent.length > 2000) {
      throw new Error('Nội dung bình luận quá dài (tối đa 2000 ký tự)');
    }

    let parentComment = null as CommentEntity | null;
    let level = 0;

    if (dto.parentCommentId) {
      parentComment = await this.commentRepository.findById(dto.parentCommentId);
      if (!parentComment) {
        throw new Error('Bình luận gốc không tồn tại');
      }

      if (!targetPostId) {
        targetPostId = parentComment.postId;
      }

      level = (parentComment.level ?? 0) + 1;
      if (level > 2) {
        throw new Error('Chỉ hỗ trợ tối đa 3 cấp trả lời');
      }
    }

    if (!targetPostId) {
      throw new Error('Post ID không được để trống');
    }

    // Ensure target post exists
    const post = await this.postRepository.findById(targetPostId);
    if (!post) {
      throw new Error('Không tìm thấy bài viết');
    }

    const commentData: Omit<CommentEntity, 'id'> = {
      postId: targetPostId,
      userId: dto.userId,
      content: trimmedContent,
      images: dto.images || [],
      cloudinaryPublicIds: dto.cloudinaryPublicIds || [],
      parentCommentId: parentComment ? parentComment.id : undefined,
      level,
      mentionedUserId: dto.mentionedUserId,
      likes: [],
      likesCount: 0,
      repliesCount: 0,
      isEdited: false,
      editedAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const created = await this.commentRepository.create(commentData);

    if (parentComment) {
      await this.commentRepository.incrementRepliesCount(parentComment.id);
    }

    await this.postRepository.incrementCommentsCount(targetPostId);

    return created;
  }
}
