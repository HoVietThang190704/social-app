import { Group } from '../../domain/entities/chat/Group.entity';
import { getIO } from '../socket/socketManager';
import { logger } from '../../shared/utils/logger';

export const emitGroupCreated = (group: Group): void => {
  try {
    // Try to retrieve initialized Socket.IO instance. If not ready, skip emitting.
    const io = getIO();

    // notify each member individually and broadcast to a group room
    for (const memberId of group.members) {
      io.to(`group-chat:user:${memberId}`).emit('group-chat:created', {
        id: group.id,
        name: group.name,
        avatar: group.avatar,
        members: group.members,
        admins: group.admins,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt
      });
    }

    // create a room for the group
    io.to(`group-chat:group:${group.id}`).emit('group-chat:created', {
      id: group.id,
      name: group.name
    });
  } catch (error) {
    // This is non-fatal: socket might not be initialized in some test contexts
    logger.warn('emitGroupCreated skipped (Socket.IO not ready)');
    logger.debug('emitGroupCreated error details:', (error as Error)?.message || error);
  }
};
