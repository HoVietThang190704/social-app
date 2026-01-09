import { ICommentRepository, CommentPagination } from '../../repositories/ICommentRepository';
import { CommentEntity } from '../../entities/Comment.entity';

export interface GetCommentsDTO {
  postId: string;
  page?: number;
  limit?: number;
}

export interface CommentNode extends CommentEntity {
  replies?: CommentNode[];
}

export interface PaginatedCommentTree {
  comments: CommentNode[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export class GetCommentsUseCase {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async execute(dto: GetCommentsDTO): Promise<PaginatedCommentTree> {
    const pagination: CommentPagination = {
      page: dto.page || 1,
      limit: dto.limit || 20,
    };

    const result = await this.commentRepository.findByPostIdWithNested(dto.postId, pagination);

    const tree = this.buildTree(result.comments);

    return {
      comments: tree,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
    };
  }

  private buildTree(flat: CommentEntity[]): CommentNode[] {
    const map = new Map<string, CommentNode>();
    const roots: CommentNode[] = [];

    flat.forEach((c) => {
      map.set(c.id, { ...(c as CommentNode), replies: [] });
    });

    map.forEach((comment) => {
      if (comment.parentCommentId && map.has(comment.parentCommentId)) {
        const parent = map.get(comment.parentCommentId)!;
        parent.replies?.push(comment);
      } else {
        roots.push(comment);
      }
    });

    const sortByCreated = (nodes: CommentNode[]) => {
      nodes.sort((a, b) => (a.createdAt?.getTime?.() || 0) - (b.createdAt?.getTime?.() || 0));
      nodes.forEach((n) => n.replies && sortByCreated(n.replies));
    };
    sortByCreated(roots);

    return roots;
  }
}
