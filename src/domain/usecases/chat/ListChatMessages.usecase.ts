import { IDirectMessageRepository } from '../../repositories/chat/IDirectMessageRepository';

interface ListChatMessagesInput {
  userId: string;
  threadId: string;
  before?: string;
  limit?: number;
}

export class ListChatMessagesUseCase {
  constructor(private chatRepository: IDirectMessageRepository) {}

  async execute(input: ListChatMessagesInput) {
    if (!input.userId || !input.threadId) {
      throw new Error('Missing parameters');
    }

    const limit = Math.min(Math.max(Number(input.limit || 20), 1), 50);

    const result = await this.chatRepository.listMessages(input.threadId, input.userId, {
      before: input.before || null,
      limit
    });

    if (!result) {
      return null;
    }

    return {
      thread: result.thread,
      messages: result.messages,
      pagination: {
        limit,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor
      }
    };
  }
}
