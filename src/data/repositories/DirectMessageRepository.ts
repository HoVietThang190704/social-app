import mongoose, { Types } from 'mongoose';
import { ChatMessage, ChatThread, IChatAttachment, IChatMessage, IChatThread } from '../../models/DirectMessage';
import { User } from '../../models/users/User';
import {
  AppendMessagePayload,
  AppendMessageResult,
  CreateThreadPayload,
  IDirectMessageRepository,
  MessageListFilters,
  MessageListResult,
  ThreadListFilters,
  ThreadListResult
} from '../../domain/repositories/chat/IDirectMessageRepository';
import {
  DirectMessageAttachment,
  DirectMessageMessageEntity,
  DirectMessageParticipant,
  DirectMessageThreadEntity
} from '../../domain/entities/chat/DirectMessage.entity';

const toObjectId = (value: string): Types.ObjectId | null => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    return null;
  }
  return new mongoose.Types.ObjectId(value);
};

const normalizeDate = (value?: Date | string | null): Date | undefined => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const normalizeId = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value instanceof Types.ObjectId) return value.toString();
  if (typeof (value as { toString?: () => string }).toString === 'function') {
    return (value as { toString: () => string }).toString();
  }
  return '';
};

export class DirectMessageRepository implements IDirectMessageRepository {
  private buildParticipants(doc: IChatThread): DirectMessageParticipant[] {
    return Array.isArray(doc.participantMeta)
      ? doc.participantMeta.map((item) => ({
          userId: item.userId?.toString() || '',
          userName: item.userName ?? null,
          avatar: item.avatar ?? null
        }))
      : [];
  }

  private buildThread(doc: IChatThread, viewerId?: string): DirectMessageThreadEntity {
    const participantIds = (doc.participants || []).map((id) => id.toString());
    const unreadSource = doc.unreadCounts instanceof Map
      ? Object.fromEntries(doc.unreadCounts)
      : ((doc.unreadCounts as unknown as Record<string, number>) || {});
    const unreadMap = Object.entries(unreadSource).reduce<Record<string, number>>((acc, [key, value]) => {
      if (key) acc[key] = Number(value) || 0;
      return acc;
    }, {});
    return {
      id: normalizeId(doc._id),
      participantIds,
      participants: this.buildParticipants(doc),
      lastMessage: doc.lastMessage ?? null,
      lastMessageAt: normalizeDate(doc.lastMessageAt) ?? null,
      lastSenderId: doc.lastSender ? doc.lastSender.toString() : null,
      unreadCount: viewerId ? Number(unreadMap[viewerId] || 0) : 0,
      unreadByUser: unreadMap,
      createdAt: normalizeDate(doc.createdAt) ?? new Date(),
      updatedAt: normalizeDate(doc.updatedAt) ?? new Date()
    };
  }

  private buildMessage(doc: IChatMessage): DirectMessageMessageEntity {
    return {
      id: normalizeId(doc._id),
      threadId: normalizeId(doc.threadId),
      senderId: normalizeId(doc.sender),
      recipientId: normalizeId(doc.recipient),
      content: doc.content ?? null,
      attachments: Array.isArray(doc.attachments)
        ? doc.attachments.map((item) => ({
            url: item.url,
            type: item.type ?? null,
            name: item.name ?? null
          }))
        : [],
      readAt: normalizeDate(doc.readAt) ?? null,
      createdAt: normalizeDate(doc.createdAt) ?? new Date()
    };
  }

  private async ensureParticipantMeta(participantIds: Types.ObjectId[]): Promise<IChatThread['participantMeta']> {
    const users = await User.find({ _id: { $in: participantIds } })
      .select('_id userName avatar')
      .lean();

    return participantIds.map((id) => {
      const matched = users.find((user) => user._id.toString() === id.toString());
      return {
        userId: id,
        userName: matched?.userName ?? null,
        avatar: matched?.avatar ?? null
      };
    });
  }

  private clampLimit(limit?: number, max = 50, defaultValue = 20) {
    if (!limit || Number.isNaN(limit)) return defaultValue;
    return Math.min(Math.max(limit, 1), max);
  }

  async getOrCreateThread(payload: CreateThreadPayload): Promise<DirectMessageThreadEntity> {
    const userId = toObjectId(payload.userId);
    const targetId = toObjectId(payload.targetUserId);

    if (!userId || !targetId) {
      throw new Error('Invalid participant id');
    }

    const participants = [userId, targetId].sort((a, b) => (a.toString() > b.toString() ? 1 : -1));
    const participantsKey = participants.map((id) => id.toString()).join(':');

    let thread = await ChatThread.findOne({ participantsKey }).lean<IChatThread>().exec();

    if (!thread) {
      const participantMeta = await this.ensureParticipantMeta(participants);
      const created = await ChatThread.create({
        participants,
        participantsKey,
        participantMeta,
        unreadCounts: { [payload.userId]: 0, [payload.targetUserId]: 0 }
      });
      thread = created.toObject();
    }

    return this.buildThread(thread, payload.userId);
  }

  async getThreadByIdForUser(threadId: string, userId: string): Promise<DirectMessageThreadEntity | null> {
    const threadObjectId = toObjectId(threadId);
    const userObjectId = toObjectId(userId);
    if (!threadObjectId || !userObjectId) return null;

    const doc = await ChatThread.findOne({ _id: threadObjectId, participants: userObjectId })
      .lean<IChatThread>()
      .exec();

    return doc ? this.buildThread(doc, userId) : null;
  }

  async listThreads(userId: string, filters?: ThreadListFilters): Promise<ThreadListResult> {
    const userObjectId = toObjectId(userId);
    if (!userObjectId) {
      return { threads: [], total: 0 };
    }

    const offset = Math.max(Number(filters?.offset || 0), 0);
    const limit = this.clampLimit(filters?.limit, 100, 20);

    const [threads, total] = await Promise.all([
      ChatThread.find({ participants: userObjectId })
        .sort({ updatedAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean<IChatThread[]>()
        .exec(),
      ChatThread.countDocuments({ participants: userObjectId })
    ]);

    return {
      threads: threads.map((thread) => this.buildThread(thread, userId)),
      total
    };
  }

  async listMessages(threadId: string, userId: string, filters?: MessageListFilters): Promise<MessageListResult | null> {
    const threadObjectId = toObjectId(threadId);
    const userObjectId = toObjectId(userId);

    if (!threadObjectId || !userObjectId) {
      return null;
    }

    const threadDoc = await ChatThread.findOne({ _id: threadObjectId, participants: userObjectId })
      .lean<IChatThread>()
      .exec();

    if (!threadDoc) {
      return null;
    }

    const limit = this.clampLimit(filters?.limit, 100, 20);
    const query: Record<string, unknown> = { threadId: threadObjectId };

    if (filters?.before) {
      const beforeDate = filters.before instanceof Date ? filters.before : new Date(filters.before);
      if (!Number.isNaN(beforeDate.getTime())) {
        query.createdAt = { $lt: beforeDate };
      }
    }

    const docs = await ChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean<IChatMessage[]>()
      .exec();

    const hasMore = docs.length > limit;
    const slice = hasMore ? docs.slice(0, limit) : docs;
    const messages = slice.reverse().map((doc) => this.buildMessage(doc));
    const nextCursor = hasMore && messages.length > 0 ? messages[0].createdAt.toISOString() : null;

    return {
      thread: this.buildThread(threadDoc, userId),
      messages,
      hasMore,
      nextCursor
    };
  }

  async appendMessage(payload: AppendMessagePayload): Promise<AppendMessageResult> {
    const threadObjectId = toObjectId(payload.threadId);
    const senderObjectId = toObjectId(payload.senderId);
    const recipientObjectId = toObjectId(payload.recipientId);

    if (!threadObjectId || !senderObjectId || !recipientObjectId) {
      throw new Error('Invalid chat identifiers');
    }

    const content = (payload.content || '').trim();
    const attachments: DirectMessageAttachment[] = Array.isArray(payload.attachments)
      ? payload.attachments.filter((item) => !!item?.url)
      : [];

    if (!content && attachments.length === 0) {
      throw new Error('Message must contain text or attachment');
    }

    const normalizedAttachments: IChatAttachment[] = attachments.map((item) => ({
      url: item.url,
      type: item.type ?? null,
      name: item.name ?? null
    }));

    const messageDoc = await ChatMessage.create({
      threadId: threadObjectId,
      sender: senderObjectId,
      recipient: recipientObjectId,
      content,
      attachments: normalizedAttachments
    });

    const preview = content || (attachments.length > 1 ? 'Đã gửi nhiều tệp' : 'Đã gửi một tệp');
    const now = new Date();

    const updatedThread = await ChatThread.findByIdAndUpdate(
      threadObjectId,
      {
        $set: {
          lastMessage: preview,
          lastMessageAt: now,
          lastSender: senderObjectId,
          [`unreadCounts.${payload.senderId}`]: 0
        },
        $inc: {
          [`unreadCounts.${payload.recipientId}`]: 1
        }
      },
      { new: true }
    )
      .lean<IChatThread>()
      .exec();

    if (!updatedThread) {
      throw new Error('Thread not found when updating message');
    }

    return {
      thread: this.buildThread(updatedThread, payload.senderId),
      message: this.buildMessage(messageDoc.toObject())
    };
  }

  async markThreadAsRead(threadId: string, userId: string): Promise<DirectMessageThreadEntity | null> {
    const threadObjectId = toObjectId(threadId);
    const userObjectId = toObjectId(userId);
    if (!threadObjectId || !userObjectId) {
      return null;
    }

    const updated = await ChatThread.findOneAndUpdate(
      { _id: threadObjectId, participants: userObjectId },
      {
        $set: {
          [`unreadCounts.${userId}`]: 0
        }
      },
      { new: true }
    )
      .lean<IChatThread>()
      .exec();

    return updated ? this.buildThread(updated, userId) : null;
  }
}
