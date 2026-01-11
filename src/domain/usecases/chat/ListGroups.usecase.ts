import { IGroupRepository } from '../../repositories/chat/IGroupRepository';
import { Group } from '../../entities/chat/Group.entity';

export class ListGroupsUseCase {
  constructor(private groupRepo: IGroupRepository) {}

  async execute(userId: string, limit = 20, offset = 0): Promise<{ groups: Group[]; total: number }> {
    const result = await this.groupRepo.findByUserId(userId, limit, offset);
    return { groups: result.groups, total: result.total };
  }
}
