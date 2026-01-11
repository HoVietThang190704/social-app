import { Request, Response } from 'express';
import { ListChatThreadsUseCase } from '../../domain/usecases/chat/ListChatThreads.usecase';
import { ListChatMessagesUseCase } from '../../domain/usecases/chat/ListChatMessages.usecase';
import { SendChatMessageUseCase } from '../../domain/usecases/chat/SendChatMessage.usecase';
import { MarkThreadReadUseCase } from '../../domain/usecases/chat/MarkThreadRead.usecase';
import { CreateGroupUseCase } from '../../domain/usecases/chat/CreateGroup.usecase';
import { ListGroupsUseCase } from '../../domain/usecases/chat/ListGroups.usecase';
import { logger } from '../../shared/utils/logger';
import { HttpStatus } from '../../shared/constants/httpStatus';

export class ChatController {
  constructor(
    private listThreadsUseCase: ListChatThreadsUseCase,
    private listMessagesUseCase: ListChatMessagesUseCase,
    private sendMessageUseCase: SendChatMessageUseCase,
    private markThreadReadUseCase: MarkThreadReadUseCase,
    private createGroupUseCase?: CreateGroupUseCase,
    private listGroupsUseCase?: ListGroupsUseCase,
    private getGroupUseCase?: import('../../domain/usecases/chat/GetGroup.usecase').GetGroupUseCase
  ) {}

  private ensureUser(req: Request, res: Response): string | null {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: 'Vui lòng đăng nhập' });
      return null;
    }
    return userId;
  }

  async listThreads(req: Request, res: Response) {
    try {
      const userId = this.ensureUser(req, res);
      if (!userId) return;

      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 20);

      const result = await this.listThreadsUseCase.execute({ userId, page, limit });
      res.json({ success: true, data: result.threads, pagination: result.pagination });
    } catch (error: any) {
      logger.error('ChatController.listThreads error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error?.message || 'Không thể tải danh sách chat' });
    }
  }

  async getMessages(req: Request, res: Response) {
    try {
      const userId = this.ensureUser(req, res);
      if (!userId) return;

      const threadId = req.params.threadId;
      const before = typeof req.query.before === 'string' ? req.query.before : undefined;
      const limit = Number(req.query.limit || 20);

      const result = await this.listMessagesUseCase.execute({ userId, threadId, before, limit });
      if (!result) {
        return res.status(HttpStatus.NOT_FOUND).json({ success: false, message: 'Không tìm thấy cuộc trò chuyện' });
      }

      res.json({ success: true, data: result });
    } catch (error: any) {
      logger.error('ChatController.getMessages error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error?.message || 'Không thể tải tin nhắn' });
    }
  }

  async sendMessage(req: Request, res: Response) {
    try {
      const userId = this.ensureUser(req, res);
      if (!userId) return;

      const { threadId, recipientId, content, attachments } = req.body;
      const result = await this.sendMessageUseCase.execute({
        senderId: userId,
        threadId,
        recipientId,
        content,
        attachments
      });

      res.status(HttpStatus.CREATED).json({ success: true, data: result });
    } catch (error: any) {
      logger.error('ChatController.sendMessage error:', error);
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error?.message || 'Không thể gửi tin nhắn' });
    }
  }



  async markThreadRead(req: Request, res: Response) {
    try {
      const userId = this.ensureUser(req, res);
      if (!userId) return;

      const threadId = req.params.threadId;
      const updated = await this.markThreadReadUseCase.execute({ userId, threadId });
      if (!updated) {
        return res.status(HttpStatus.NOT_FOUND).json({ success: false, message: 'Không tìm thấy cuộc trò chuyện' });
      }
      res.json({ success: true, data: updated });
    } catch (error: any) {
      logger.error('ChatController.markThreadRead error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error?.message || 'Không thể cập nhật trạng thái đọc' });
    }
  }

  async createGroup(req: Request, res: Response) {
    try {
      const userId = this.ensureUser(req, res);
      if (!userId) return;

      const { name, memberIds, avatar } = req.body as { name: string; memberIds?: string[]; avatar?: string };
      if (!this.createGroupUseCase) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Group feature unavailable' });
      }

      const group = await this.createGroupUseCase.execute({ name, creatorId: userId, memberIds, avatar });
      res.status(HttpStatus.CREATED).json({ success: true, data: group });
    } catch (error: any) {
      logger.error('ChatController.createGroup error:', error);
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error?.message || 'Không thể tạo nhóm' });
    }
  }

  async listGroups(req: Request, res: Response) {
    try {
      const userId = this.ensureUser(req, res);
      if (!userId) return;

      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 20);

      if (!this.listGroupsUseCase) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Group feature unavailable' });
      }

      const result = await this.listGroupsUseCase.execute(userId, limit, (page - 1) * limit);
      res.json({ success: true, data: result.groups, total: result.total, page, limit });
    } catch (error: any) {
      logger.error('ChatController.listGroups error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error?.message || 'Không thể lấy danh sách nhóm' });
    }
  }

  async getGroup(req: Request, res: Response) {
    try {
      const userId = this.ensureUser(req, res);
      if (!userId) return;

      const groupId = req.params.groupId;
      if (!this.getGroupUseCase) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Group feature unavailable' });
      }

      const group = await this.getGroupUseCase.execute(groupId);
      if (!group) return res.status(HttpStatus.NOT_FOUND).json({ success: false, message: 'Không tìm thấy nhóm' });
      res.json({ success: true, data: group });
    } catch (error: any) {
      logger.error('ChatController.getGroup error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error?.message || 'Không thể lấy nhóm' });
    }
  }
}
