import { IDirectMessageRepository } from '../../repositories/chat/IDirectMessageRepository';
import { DirectMessageAttachment } from '../../entities/chat/DirectMessage.entity';
import { emitDirectMessage, emitDirectThreadUpdate } from '../../../services/chat/directMessageEvents';
import { pushNotificationService } from '../../../services/notification/PushNotificationService';
import { User } from '../../../models/users/User';
import { logger } from '../../../shared/utils/logger';

interface SendChatMessageInput {
  senderId: string;
  recipientId: string;
  threadId?: string;
  content?: string | null;
  attachments?: DirectMessageAttachment[];
}

export class SendChatMessageUseCase {
  constructor(private chatRepository: IDirectMessageRepository) {}

  async execute(input: SendChatMessageInput) {
    if (!input.senderId || !input.recipientId) {
      throw new Error('Thiếu thông tin người gửi hoặc người nhận');
    }

    if (input.senderId === input.recipientId) {
      throw new Error('Không thể tự nhắn tin cho chính mình');
    }

    const threadId = input.threadId && input.threadId.trim().length > 0
      ? await this.validateThreadAccess(input.threadId, input.senderId)
      : await this.resolveThreadId(input.senderId, input.recipientId);

    const result = await this.chatRepository.appendMessage({
      threadId,
      senderId: input.senderId,
      recipientId: input.recipientId,
      content: input.content,
      attachments: input.attachments
    });

    emitDirectMessage(result.thread, result.message);
    emitDirectThreadUpdate(result.thread);

    await this.sendNewMessageNotification(input.senderId, input.recipientId, input.content, result.thread.id);

    return result;
  }

  private async sendNewMessageNotification(
    senderId: string,
    recipientId: string,
    content: string | null | undefined,
    threadId: string
  ): Promise<void> {
    try {
      const [sender, recipient] = await Promise.all([
        User.findById(senderId).select('userName email avatar').lean(),
        User.findById(recipientId).select('userName email pushToken').lean()
      ]);

      if (!sender || !recipient) return;

      const senderName = sender.userName || sender.email || 'Someone';
      const messagePreview = content && content.length > 50 
        ? content.substring(0, 50) + '...' 
        : content || 'Sent an attachment';

      // Only send push notification, don't save to database
      const recipientPushToken = (recipient as any).pushToken;
      if (recipientPushToken) {
        await pushNotificationService.sendToDevice(recipientPushToken, {
          title: 'New Message',
          body: `${senderName}: ${messagePreview}`,
          data: {
            type: 'new_message',
            senderId: senderId,
            senderName: senderName,
            senderAvatar: sender.avatar || null,
            threadId: threadId
          }
        });
      }
    } catch (error) {
      logger.error('Error sending new message notification:', error);
    }
  }

  private async resolveThreadId(senderId: string, recipientId: string): Promise<string> {
    const thread = await this.chatRepository.getOrCreateThread({ userId: senderId, targetUserId: recipientId });
    return thread.id;
  }

  private async validateThreadAccess(threadId: string, userId: string): Promise<string> {
    const thread = await this.chatRepository.getThreadByIdForUser(threadId, userId);
    if (!thread) {
      throw new Error('Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này');
    }
    return thread.id;
  }
}
