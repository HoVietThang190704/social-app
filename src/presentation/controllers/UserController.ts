import { Request, Response } from 'express';
import { GetUsersUseCase } from '../../domain/usecases/user/GetUsers.usecase';
import { UserMapper } from '../dto/user/User.dto';
import { logger } from '../../shared/utils/logger';

export class UserController {
  constructor(
    private getUserProfileUseCase: any,
    private updateUserProfileUseCase: any,
    private resetPasswordUseCase: any,
    private changePasswordUseCase: any,
    private updateUserAvatarUseCase: any,
    private lockUserUseCase: any,
    private getUsersUseCase: GetUsersUseCase
  ) {}

  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const user = await this.getUserProfileUseCase.execute(userId);
      res.json({ success: true, data: user });
    } catch (err: any) {
      logger.error('UserController.getProfile error:', err);
      res.status(500).json({ success: false, message: err?.message || 'Internal error' });
    }
  }

  async getPublicProfile(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const user = await this.getUserProfileUseCase.execute(userId);
      if (!user) return res.status(404).json({ success: false, message: 'Not found' });
      res.json({ success: true, data: user });
    } catch (err: any) {
      logger.error('UserController.getPublicProfile error:', err);
      res.status(500).json({ success: false, message: err?.message || 'Internal error' });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const data = req.body;
      const updated = await this.updateUserProfileUseCase.execute({
        userId,
        userName: data.userName,
        phone: data.phone,
        avatar: data.avatar,
        role: data.role,
        isVerified: data.isVerified,
        address: data.address,
        dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
      });
      res.json({ success: true, data: updated });
    } catch (err: any) {
      logger.error('UserController.updateProfile error:', err);
      res.status(500).json({ success: false, message: err?.message || 'Internal error' });
    }
  }

  async uploadAvatar(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const file = req.file;
      if (!file) return res.status(400).json({ success: false, message: 'File không hợp lệ' });
      const result = await this.updateUserAvatarUseCase.execute(userId, file);
      res.json({ success: true, data: result });
    } catch (err: any) {
      logger.error('UserController.uploadAvatar error:', err);
      res.status(500).json({ success: false, message: err?.message || 'Internal error' });
    }
  }

  async lockUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const { lock } = req.body;
      const result = await this.lockUserUseCase.execute({ id: userId, lock });
      res.json({ success: true, data: result });
    } catch (err: any) {
      logger.error('UserController.lockUser error:', err);
      res.status(500).json({ success: false, message: 'Internal error' });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      await this.resetPasswordUseCase.execute(req);
      res.json({ success: true, message: 'Password reset initiated' });
    } catch (err: any) {
      logger.error('UserController.resetPassword error:', err);
      res.status(500).json({ success: false, message: 'Internal error' });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const { currentPassword, newPassword } = req.body || {};
      await this.changePasswordUseCase.execute(userId, currentPassword, newPassword);
      res.json({ success: true, message: 'Password changed' });
    } catch (err: any) {
      logger.error('UserController.changePassword error:', err);
      res.status(500).json({ success: false, message: err?.message || 'Internal error' });
    }
  }

  async searchUsers(req: Request, res: Response) {
    try {
      const query = typeof req.query.q === 'string'
        ? req.query.q
        : (typeof req.query.search === 'string' ? req.query.search : '');

      const page = Math.max(Number(req.query.page || 1), 1);
      const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 50);

      if (!query || query.trim().length < 2) {
        return res.json({
          success: true,
          message: 'Vui lòng nhập tối thiểu 2 ký tự để tìm kiếm',
          data: {
            users: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0
            }
          }
        });
      }

      const result = await this.getUsersUseCase.execute({
        search: query,
        page,
        limit,
        sortBy: 'userName',
        sortOrder: 'asc'
      });

      const users = result.users.map((u: any) => UserMapper.toResponseDto(u));

      res.json({
        success: true,
        message: 'Tìm kiếm người dùng thành công',
        data: {
          users,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: Math.ceil((result.total || 0) / result.limit)
          }
        }
      });
    } catch (err: any) {
      logger.error('UserController.searchUsers error:', err);
      res.status(500).json({ success: false, message: 'Lỗi server khi tìm kiếm người dùng' });
    }
  }
}

export default UserController;