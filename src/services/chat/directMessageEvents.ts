import { DirectMessageMessageEntity, DirectMessageThreadEntity } from '../../domain/entities/chat/DirectMessage.entity';
import { getIO } from '../socket/socketManager';
import { logger } from '../../shared/utils/logger';

const buildThreadPayload = (thread: DirectMessageThreadEntity, viewerId?: string) => ({
  threadId: thread.id,
  participantIds: thread.participantIds,
  participants: thread.participants,
  lastMessage: thread.lastMessage,
  lastMessageAt: thread.lastMessageAt,
  lastSenderId: thread.lastSenderId,
  unreadCount: viewerId ? (thread.unreadByUser?.[viewerId] ?? 0) : thread.unreadCount,
  unreadByUser: thread.unreadByUser,
  createdAt: thread.createdAt,
  updatedAt: thread.updatedAt
});

export const emitDirectMessage = (thread: DirectMessageThreadEntity, message: DirectMessageMessageEntity): void => {
  try {
    const io = getIO();
    thread.participantIds.forEach((participantId) => {
      const payload = {
        thread: buildThreadPayload(thread, participantId),
        message
      };
      io.to(`friend-chat:user:${participantId}`).emit('friend-chat:new-message', payload);
    });
    io.to(`friend-chat:thread:${thread.id}`).emit('friend-chat:new-message', {
      thread: buildThreadPayload(thread),
      message
    });
  } catch (error) {
    logger.error('emitDirectMessage error:', error);
  }
};

export const emitDirectThreadUpdate = (thread: DirectMessageThreadEntity): void => {
  try {
    const io = getIO();
    thread.participantIds.forEach((participantId) => {
      io.to(`friend-chat:user:${participantId}`).emit('friend-chat:thread-update', buildThreadPayload(thread, participantId));
    });
  } catch (error) {
    logger.error('emitDirectThreadUpdate error:', error);
  }
};
