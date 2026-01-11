import { PostMapper, PostDTO } from '../post/Post.dto';
import { UserMapper, UserResponseDto } from '../user/User.dto';
import { GlobalSearchResult } from '../../../domain/usecases/search/GlobalSearch.usecase';

export interface SearchSectionDTO<T> {
  items: T[];
  total: number;
  limit: number;
  hasMore: boolean;
}

export interface SearchPostsSectionDTO extends SearchSectionDTO<PostDTO> {
  page: number;
  totalPages: number;
}

export interface SearchResponseDTO {
  query: string;
  products: SearchSectionDTO<any>;
  posts: SearchPostsSectionDTO;
  users: SearchSectionDTO<UserResponseDto>;
}

export class SearchMapper {
  static toDTO(result: GlobalSearchResult, currentUserId?: string): SearchResponseDTO {
    return {
      query: result.query,
      products: {
        items: result.products?.items ?? [],
        total: result.products?.total ?? 0,
        limit: result.products?.limit ?? 0,
        hasMore: result.products?.hasMore ?? false
      },
      posts: {
        items: PostMapper.toDTOs(result.posts.items, currentUserId),
        total: result.posts.total,
        limit: result.posts.limit,
        hasMore: result.posts.hasMore,
        page: result.posts.page,
        totalPages: result.posts.totalPages ?? 0
      },
      users: {
        items: result.users.items.map((user: any) => UserMapper.toResponseDto(user)),
        total: result.users.total,
        limit: result.users.limit,
        hasMore: result.users.hasMore
      }
    };
  }
}
