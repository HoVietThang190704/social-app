import { IGroupRepository, CreateGroupPayload } from '../../repositories/chat/IGroupRepository';
import { Group } from '../../entities/chat/Group.entity';
import { emitGroupCreated } from '../../../services/chat/groupChatEvents';

export interface CreateGroupDTO {
  name: string;
  creatorId: string;
  memberIds?: string[];
  avatar?: string | null;
}

export class CreateGroupUseCase {
  constructor(private groupRepo: IGroupRepository) {}

  async execute(dto: CreateGroupDTO): Promise<Group> {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new Error('Group name is required');
    }
    // Normalize and dedupe members
    const payload: CreateGroupPayload = {
      name: dto.name.trim(),
      creatorId: dto.creatorId,
      memberIds: dto.memberIds ?? [],
      avatar: dto.avatar ?? null
    };

    const group = await this.groupRepo.create(payload);

    // Emit socket event to notify members
    try {
      emitGroupCreated(group);
    } catch (e) {
      // non-fatal
    }

    return group;
  }
}
