import { DirectMessageAttachment, DirectMessageMessageEntity, DirectMessageThreadEntity } from '../../entities/chat/DirectMessage.entity';

export interface ThreadListFilters {
  limit?: number;
  offset?: number;
}

export interface MessageListFilters {
  limit?: number;
  before?: Date | string | null;
}

export interface AppendMessagePayload {
  threadId: string;
  senderId: string;
  recipientId: string;
  content?: string | null;
  attachments?: DirectMessageAttachment[];
}

export interface CreateThreadPayload {
  userId: string;
  targetUserId: string;
}

export interface AppendMessageResult {
  thread: DirectMessageThreadEntity;
  message: DirectMessageMessageEntity;
}

export interface ThreadListResult {
  threads: DirectMessageThreadEntity[];
  total: number;
}

export interface MessageListResult {
  thread: DirectMessageThreadEntity;
  messages: DirectMessageMessageEntity[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface IDirectMessageRepository {
  getOrCreateThread(payload: CreateThreadPayload): Promise<DirectMessageThreadEntity>;
  getThreadByIdForUser(threadId: string, userId: string): Promise<DirectMessageThreadEntity | null>;
  listThreads(userId: string, filters?: ThreadListFilters): Promise<ThreadListResult>;
  listMessages(threadId: string, userId: string, filters?: MessageListFilters): Promise<MessageListResult | null>;
  appendMessage(payload: AppendMessagePayload): Promise<AppendMessageResult>;
  markThreadAsRead(threadId: string, userId: string): Promise<DirectMessageThreadEntity | null>;
}
