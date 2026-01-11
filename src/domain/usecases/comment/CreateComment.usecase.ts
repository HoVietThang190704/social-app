import { ICommentRepository } from '../../repositories/ICommentRepository';
import { IPostRepository } from '../../repositories/IPostRepository';
import { CommentEntity } from '../../entities/Comment.entity';
import { notificationService } from '../../../services/notification/NotificationService';
import { pushNotificationService } from '../../../services/notification/PushNotificationService';
import { User } from '../../../models/users/User';
import { logger } from '../../../shared/utils/logger';

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

    // Send notifications for comment
    await this.sendCommentNotifications(
      dto.userId,
      post.userId,
      targetPostId,
      trimmedContent,
      created.id,
      parentComment
    );

    return created;
  }

  private async sendCommentNotifications(
    commenterId: string,
    postOwnerId: string,
    postId: string,
    commentContent: string,
    commentId: string,
    parentComment: CommentEntity | null
  ): Promise<void> {
    try {
      // Get commenter info
      const commenter = await User.findById(commenterId).select('userName email avatar').lean();
      if (!commenter) return;

      const commenterName = commenter.userName || commenter.email || 'Someone';
      const commentPreview = commentContent && commentContent.length > 50
        ? commentContent.substring(0, 50) + '...'
        : commentContent || 'Commented with an image';

      // 1. Notify post owner (if commenter is not the post owner)
      if (commenterId !== postOwnerId) {
        await this.notifyPostOwner(postOwnerId, commenterId, commenterName, commenter.avatar, postId, commentId, commentPreview);
      }

      // 2. Notify parent comment author (if this is a reply and the parent author is different from commenter and post owner)
      if (parentComment && parentComment.userId !== commenterId && parentComment.userId !== postOwnerId) {
        await this.notifyCommentAuthor(parentComment.userId, commenterId, commenterName, commenter.avatar, postId, commentId, commentPreview);
      }
    } catch (error) {
      logger.error('Error sending comment notifications:', error);
    }
  }

  private async notifyPostOwner(
    postOwnerId: string,
    commenterId: string,
    commenterName: string,
    commenterAvatar: string | null | undefined,
    postId: string,
    commentId: string,
    commentPreview: string
  ): Promise<void> {
    const postOwner = await User.findById(postOwnerId).select('userName email pushToken').lean();
    if (!postOwner) return;

    // Save notification to database
    await notificationService.send({
      audience: 'user',
      targetId: postOwnerId,
      type: 'comment',
      title: 'New Comment',
      message: `${commenterName} commented on your post: ${commentPreview}`,
      payload: {
        type: 'comment',
        commenterId: commenterId,
        commenterName: commenterName,
        commenterAvatar: commenterAvatar || null,
        postId: postId,
        commentId: commentId
      }
    });

    // Send push notification
    const ownerPushToken = (postOwner as any).pushToken;
    if (ownerPushToken) {
      await pushNotificationService.sendToDevice(ownerPushToken, {
        title: 'New Comment',
        body: `${commenterName} commented on your post: ${commentPreview}`,
        data: {
          type: 'comment',
          commenterId: commenterId,
          commenterName: commenterName,
          postId: postId,
          commentId: commentId
        }
      });
    }
  }

  private async notifyCommentAuthor(
    commentAuthorId: string,
    replierId: string,
    replierName: string,
    replierAvatar: string | null | undefined,
    postId: string,
    commentId: string,
    commentPreview: string
  ): Promise<void> {
    const commentAuthor = await User.findById(commentAuthorId).select('userName email pushToken').lean();
    if (!commentAuthor) return;

    // Save notification to database
    await notificationService.send({
      audience: 'user',
      targetId: commentAuthorId,
      type: 'comment_reply',
      title: 'New Reply',
      message: `${replierName} replied to your comment: ${commentPreview}`,
      payload: {
        type: 'comment_reply',
        replierId: replierId,
        replierName: replierName,
        replierAvatar: replierAvatar || null,
        postId: postId,
        commentId: commentId
      }
    });

    // Send push notification
    const authorPushToken = (commentAuthor as any).pushToken;
    if (authorPushToken) {
      await pushNotificationService.sendToDevice(authorPushToken, {
        title: 'New Reply',
        body: `${replierName} replied to your comment: ${commentPreview}`,
        data: {
          type: 'comment_reply',
          replierId: replierId,
          replierName: replierName,
          postId: postId,
          commentId: commentId
        }
      });
    }
  }
}
