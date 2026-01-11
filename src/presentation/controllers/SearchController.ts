import { Request, Response } from 'express';
import { GlobalSearchUseCase } from '../../domain/usecases/search/GlobalSearch.usecase';
import { SearchMapper } from '../dto/search/Search.dto';
import { logger } from '../../shared/utils/logger';

export class SearchController {
  constructor(private readonly globalSearchUseCase: GlobalSearchUseCase) {}

  async search(req: Request, res: Response): Promise<void> {
    try {
      const queryParam = typeof req.query.q === 'string'
        ? req.query.q
        : (typeof req.query.search === 'string' ? req.query.search : '');

      const userPage = Math.max(parseInt(req.query.userPage as string) || 1, 1);
      const userLimit = Math.min(Math.max(parseInt(req.query.userLimit as string) || 10, 1), 50);
      const postPage = Math.max(parseInt((req.query.postPage || req.query.page) as string) || 1, 1);
      const postLimit = Math.min(Math.max(parseInt((req.query.postLimit || req.query.limit) as string) || 10, 1), 50);

      const query = queryParam.trim();

      if (query.length < 2) {
        res.status(200).json({
          success: true,
          message: 'Vui lòng nhập tối thiểu 2 ký tự để tìm kiếm',
          data: SearchMapper.toDTO({
            query,
            users: { items: [], total: 0, page: userPage, limit: userLimit, hasMore: false },
            posts: { items: [], total: 0, page: postPage, limit: postLimit, totalPages: 0, hasMore: false }
          }, (req as any).user?.id)
        });
        return;
      }

      const result = await this.globalSearchUseCase.execute({
        query,
        userPage,
        userLimit,
        postPage,
        postLimit
      });

      res.json({
        success: true,
        data: SearchMapper.toDTO(result, (req as any).user?.id)
      });
    } catch (error: any) {
      logger.error('SearchController.search error:', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Lỗi server khi tìm kiếm'
      });
    }
  }
}
