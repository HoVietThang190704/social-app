import { GroupEntity } from '../../entities/chat/Group.entity';

export interface CreateGroupPayload {
  name: string;
  creatorId: string;
  memberIds?: string[]; // optional additional members
  avatar?: string | null;
}

export interface PaginatedGroups {
  groups: GroupEntity[];
  total: number;
}

export interface IGroupRepository {
  create(payload: CreateGroupPayload): Promise<GroupEntity>;
  findById(id: string): Promise<GroupEntity | null>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<PaginatedGroups>;
  addMembers(groupId: string, memberIds: string[]): Promise<GroupEntity | null>;
  removeMembers(groupId: string, memberIds: string[]): Promise<GroupEntity | null>;
  update(groupId: string, data: Partial<GroupEntity>): Promise<GroupEntity | null>;
}
