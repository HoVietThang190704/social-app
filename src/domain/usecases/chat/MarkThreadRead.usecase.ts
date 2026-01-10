import { IDirectMessageRepository } from '../../repositories/chat/IDirectMessageRepository';
import { emitDirectThreadUpdate } from '../../../services/chat/directMessageEvents';

interface MarkThreadReadInput {
  userId: string;
  threadId: string;
}

export class MarkThreadReadUseCase {
  constructor(private chatRepository: IDirectMessageRepository) {}

  async execute(input: MarkThreadReadInput) {
    if (!input.userId || !input.threadId) {
      throw new Error('Missing parameters');
    }

    const updated = await this.chatRepository.markThreadAsRead(input.threadId, input.userId);
    if (updated) {
      emitDirectThreadUpdate(updated);
    }
    return updated;
  }
}
