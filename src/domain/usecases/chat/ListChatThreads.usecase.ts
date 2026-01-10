import { IDirectMessageRepository } from '../../repositories/chat/IDirectMessageRepository';

interface ListChatThreadsInput {
  userId: string;
  page?: number;
  limit?: number;
}

export class ListChatThreadsUseCase {
  constructor(private chatRepository: IDirectMessageRepository) {}

  async execute(input: ListChatThreadsInput) {
    if (!input.userId) {
      throw new Error('Missing user id');
    }

    const page = Math.max(Number(input.page || 1), 1);
    const limit = Math.min(Math.max(Number(input.limit || 20), 1), 50);
    const offset = (page - 1) * limit;

    const result = await this.chatRepository.listThreads(input.userId, { limit, offset });

    return {
      threads: result.threads,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil((result.total || 0) / limit)
      }
    };
  }
}
