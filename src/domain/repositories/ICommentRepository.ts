import { CommentEntity } from '../entities/Comment.entity';

export interface CommentFilters {
  postId?: string;
  userId?: string;
  authorId?: string;
  parentCommentId?: string | null;
  level?: number;
  hasImages?: boolean;
  minLikes?: number;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface CommentSorting {
  sortBy: string;
  order: 'asc' | 'desc';
}

export interface CommentPagination {
  page?: number;
  limit?: number;
}

export interface PaginatedComments {
  comments: CommentEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ICommentRepository {
  create(comment: Omit<CommentEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<CommentEntity>;
  findById(id: string): Promise<CommentEntity | null>;
  findAll(filters?: CommentFilters, sorting?: CommentSorting, pagination?: CommentPagination): Promise<PaginatedComments>;
  findByPostId(postId: string, pagination?: CommentPagination): Promise<PaginatedComments>;
  findReplies(parentCommentId: string, pagination?: CommentPagination): Promise<PaginatedComments>;
  findThread(parentCommentId: string): Promise<CommentEntity[]>;
  findByPostIdWithNested(postId: string, pagination?: CommentPagination): Promise<PaginatedComments>;
  toggleLike(commentId: string, userId: string): Promise<{ liked: boolean; likesCount: number }>;
  incrementRepliesCount(commentId: string): Promise<CommentEntity | null>;
  decrementRepliesCount(commentId: string): Promise<CommentEntity | null>;
  deleteWithReplies(commentId: string): Promise<number>;
  deleteByPostId(postId: string): Promise<void>;
}