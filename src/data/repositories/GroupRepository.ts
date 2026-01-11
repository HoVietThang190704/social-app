import { IGroupRepository, CreateGroupPayload, PaginatedGroups } from '../../domain/repositories/chat/IGroupRepository';
import { GroupChat } from '../../models/GroupChat';
import { Group } from '../../domain/entities/chat/Group.entity';
import { logger } from '../../shared/utils/logger';

export class GroupRepository implements IGroupRepository {
  private toEntity(doc: any): Group {
    return new Group({
      id: String(doc._id),
      name: doc.name,
      avatar: doc.avatar || null,
      members: ((doc.members || []) as any[]).map((id) => String(id)),
      admins: ((doc.admins || []) as any[]).map((id) => String(id)),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }

  async create(payload: CreateGroupPayload): Promise<Group> {
    try {
      const members = Array.from(new Set([...(payload.memberIds || []), payload.creatorId]));
      const admins = [payload.creatorId];
      const doc = new GroupChat({
        name: payload.name,
        avatar: payload.avatar || null,
        members,
        admins
      });
      const saved = await doc.save();
      return this.toEntity(saved);
    } catch (error) {
      logger.error('GroupRepository.create error:', error);
      throw new Error('Lỗi khi tạo nhóm');
    }
  }

  async findById(id: string) {
    try {
      const doc = await GroupChat.findById(id).lean();
      if (!doc) return null;
      return this.toEntity(doc);
    } catch (error) {
      logger.error('GroupRepository.findById error:', error);
      throw new Error('Lỗi khi tìm nhóm');
    }
  }

  async findByUserId(userId: string, limit = 20, offset = 0): Promise<PaginatedGroups> {
    try {
      const filter = { members: userId };
      const [docs, total] = await Promise.all([
        GroupChat.find(filter).sort({ updatedAt: -1 }).skip(offset).limit(limit).lean(),
        GroupChat.countDocuments(filter)
      ]);
      return { groups: docs.map(d => this.toEntity(d)), total };
    } catch (error) {
      logger.error('GroupRepository.findByUserId error:', error);
      throw new Error('Lỗi khi lấy nhóm');
    }
  }

  async addMembers(groupId: string, memberIds: string[]) {
    try {
      const updated = await GroupChat.findByIdAndUpdate(
        groupId,
        { $addToSet: { members: { $each: memberIds } } },
        { new: true }
      ).lean();
      if (!updated) return null;
      return this.toEntity(updated);
    } catch (error) {
      logger.error('GroupRepository.addMembers error:', error);
      throw new Error('Lỗi khi thêm thành viên');
    }
  }

  async removeMembers(groupId: string, memberIds: string[]) {
    try {
      const updated = await GroupChat.findByIdAndUpdate(
        groupId,
        { $pull: { members: { $in: memberIds } } },
        { new: true }
      ).lean();
      if (!updated) return null;
      return this.toEntity(updated);
    } catch (error) {
      logger.error('GroupRepository.removeMembers error:', error);
      throw new Error('Lỗi khi xóa thành viên');
    }
  }

  async update(groupId: string, data: Partial<Group>) {
    try {
      const updated = await GroupChat.findByIdAndUpdate(groupId, { $set: data }, { new: true }).lean();
      if (!updated) return null;
      return this.toEntity(updated);
    } catch (error) {
      logger.error('GroupRepository.update error:', error);
      throw new Error('Lỗi khi cập nhật nhóm');
    }
  }
}
