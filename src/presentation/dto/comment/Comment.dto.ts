import { CommentEntity } from '../../../domain/entities/Comment.entity';
import { CommentNode } from '../../../domain/usecases/comment/GetComments.usecase';

export interface CommentDTO {
  id: string;
  postId: string;
  userId: string;
  user?: {
    id: string;
    userName?: string;
    email?: string;
    avatar?: string;
  };
  content: string;
  images: string[];
  cloudinaryPublicIds?: string[];
  parentCommentId?: string | null;
  level: number;
  mentionedUserId?: string;
  mentionedUser?: {
    id: string;
    userName?: string;
    email?: string;
    avatar?: string;
  };
  likesCount: number;
  repliesCount: number;
  isLiked?: boolean;
  isEdited?: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
  replies?: CommentDTO[];
}

export class CommentMapper {
  static toDTO(entity: CommentEntity | CommentNode, currentUserId?: string): CommentDTO {
    const replies = (entity as any).replies as CommentNode[] | undefined;
    const likes = entity.likes || [];

    return {
      id: entity.id,
      postId: entity.postId,
      userId: entity.userId,
      user: (entity as any).user,
      content: entity.content,
      images: entity.images || [],
      cloudinaryPublicIds: entity.cloudinaryPublicIds,
      parentCommentId: entity.parentCommentId,
      level: entity.level ?? 0,
      mentionedUserId: entity.mentionedUserId,
      mentionedUser: (entity as any).mentionedUser,
      likesCount: entity.likesCount ?? likes.length ?? 0,
      repliesCount: entity.repliesCount ?? (replies ? replies.length : 0),
      isLiked: currentUserId ? likes.includes(currentUserId) : undefined,
      isEdited: entity.isEdited,
      editedAt: entity.editedAt ? entity.editedAt.toISOString() : undefined,
      createdAt: entity.createdAt?.toISOString?.() ?? new Date(entity.createdAt).toISOString(),
      updatedAt: entity.updatedAt?.toISOString?.() ?? new Date(entity.updatedAt).toISOString(),
      replies: replies?.map((reply) => this.toDTO(reply, currentUserId)),
    };
  }

  static toDTOs(entities: Array<CommentEntity | CommentNode>, currentUserId?: string): CommentDTO[] {
    return entities.map((entity) => this.toDTO(entity, currentUserId));
  }
}
