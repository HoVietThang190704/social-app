"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchMapper = void 0;
const Post_dto_1 = require("../post/Post.dto");
const User_dto_1 = require("../user/User.dto");
class SearchMapper {
    static toDTO(result, currentUserId) {
        return {
            query: result.query,
            products: {
                items: result.products?.items ?? [],
                total: result.products?.total ?? 0,
                limit: result.products?.limit ?? 0,
                hasMore: result.products?.hasMore ?? false
            },
            posts: {
                items: Post_dto_1.PostMapper.toDTOs(result.posts.items, currentUserId),
                total: result.posts.total,
                limit: result.posts.limit,
                hasMore: result.posts.hasMore,
                page: result.posts.page,
                totalPages: result.posts.totalPages ?? 0
            },
            users: {
                items: result.users.items.map((user) => User_dto_1.UserMapper.toResponseDto(user)),
                total: result.users.total,
                limit: result.users.limit,
                hasMore: result.users.hasMore
            }
        };
    }
}
exports.SearchMapper = SearchMapper;
