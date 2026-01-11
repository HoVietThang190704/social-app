import { IGroupRepository } from '../../repositories/chat/IGroupRepository';
import { Group } from '../../entities/chat/Group.entity';

export class GetGroupUseCase {
  constructor(private groupRepo: IGroupRepository) {}

  async execute(groupId: string): Promise<Group | null> {
    return this.groupRepo.findById(groupId);
  }
}
