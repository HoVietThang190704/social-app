import { GetUsersUseCase } from '../user/GetUsers.usecase';
import { SearchPostsUseCase } from '../post/GetPosts.usecase';
import { UserEntity } from '../../entities/User.entity';
import { PostEntity } from '../../entities/Post.entity';

export interface GlobalSearchParams {
  query: string;
  userPage?: number;
  userLimit?: number;
  postPage?: number;
  postLimit?: number;
}

export interface GlobalSearchSection<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
  hasMore: boolean;
}

export interface GlobalSearchResult {
  query: string;
  users: GlobalSearchSection<UserEntity>;
  posts: GlobalSearchSection<PostEntity>;
  products?: { items: any[]; total: number; limit: number; hasMore: boolean };
}

export class GlobalSearchUseCase {
  constructor(
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly searchPostsUseCase: SearchPostsUseCase
  ) {}

  async execute(params: GlobalSearchParams): Promise<GlobalSearchResult> {
    const query = params.query?.trim();
    const userPage = Math.max(params.userPage ?? 1, 1);
    const userLimit = Math.min(Math.max(params.userLimit ?? 10, 1), 50);
    const postPage = Math.max(params.postPage ?? 1, 1);
    const postLimit = Math.min(Math.max(params.postLimit ?? 10, 1), 50);

    if (!query || query.length < 2) {
      throw new Error('Vui lòng nhập tối thiểu 2 ký tự để tìm kiếm');
    }

    const [usersResult, postsResult] = await Promise.all([
      this.getUsersUseCase.execute({
        search: query,
        page: userPage,
        limit: userLimit,
        sortBy: 'userName',
        sortOrder: 'asc'
      }),
      this.searchPostsUseCase.execute(query, { page: postPage, limit: postLimit })
    ]);

    const users: GlobalSearchSection<UserEntity> = {
      items: usersResult.users,
      total: usersResult.total,
      page: usersResult.page,
      limit: usersResult.limit,
      hasMore: usersResult.total > usersResult.limit * usersResult.page
    };

    const posts: GlobalSearchSection<PostEntity> = {
      items: postsResult.posts,
      total: postsResult.total,
      page: postsResult.page,
      limit: postsResult.limit,
      totalPages: postsResult.totalPages,
      hasMore: postsResult.hasMore
    };

    return {
      query,
      users,
      posts,
      products: { items: [], total: 0, limit: 0, hasMore: false }
    };
  }
}
