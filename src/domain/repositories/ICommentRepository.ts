export interface CommentFilters {
  postId?: string;
  userId?: string;
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
  comments: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ICommentRepository {
  create(comment: any): Promise<any>;
  findById(id: string): Promise<any | null>;
  findAll(filters?: CommentFilters, sorting?: CommentSorting, pagination?: CommentPagination): Promise<PaginatedComments>;
  findByPost(postId: string, options?: any): Promise<{ items: any[]; total: number }>;
  deleteByPostId(postId: string): Promise<void>;
}