import { Router } from 'express';
import { SearchController } from '../presentation/controllers/SearchController';
import { UserRepository } from '../data/repositories/UserRepository';
import { PostRepository } from '../data/repositories/PostRepository';
import { GetUsersUseCase } from '../domain/usecases/user/GetUsers.usecase';
import { SearchPostsUseCase } from '../domain/usecases/post/GetPosts.usecase';
import { GlobalSearchUseCase } from '../domain/usecases/search/GlobalSearch.usecase';
import { elasticsearchService } from '../services/search';
import { optionalAuthMiddleware } from '../shared/middleware/auth.middleware';

const router = Router();

const userRepository = new UserRepository();
const postRepository = new PostRepository();
const getUsersUseCase = new GetUsersUseCase(userRepository);
const searchPostsUseCase = new SearchPostsUseCase(postRepository, elasticsearchService);
const globalSearchUseCase = new GlobalSearchUseCase(getUsersUseCase, searchPostsUseCase);
const searchController = new SearchController(globalSearchUseCase);

router.get('/', optionalAuthMiddleware, (req, res) => searchController.search(req, res));

export default router;
