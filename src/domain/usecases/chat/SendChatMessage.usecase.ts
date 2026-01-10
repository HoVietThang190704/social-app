import { IDirectMessageRepository } from '../../repositories/chat/IDirectMessageRepository';
import { DirectMessageAttachment } from '../../entities/chat/DirectMessage.entity';
import { emitDirectMessage, emitDirectThreadUpdate } from '../../../services/chat/directMessageEvents';

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

    return result;
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
