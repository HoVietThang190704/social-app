import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';
import { logger } from '../../shared/utils/logger';
import { supportChatJoinSchema, supportChatJoinAdminSchema } from '../../shared/validation/socket.schema';
import jwt from 'jsonwebtoken';
import { config } from '../../config';

type SocketAuthPayload = {
  userId: string;
  email?: string;
  role?: string;
};

export class SocketService {
  private io: SocketIOServer;

  constructor(server: HttpServer | HttpsServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: true,
        credentials: true,
        methods: ['GET', 'POST']
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info(`🔌 Socket connected: ${socket.id}`);
      const authUser = this.extractAuthUser(socket);

      if (authUser) {
        socket.data.user = authUser;
        socket.join(`friend-chat:user:${authUser.userId}`);
        socket.emit('friend-chat:ready', { userId: authUser.userId });
      } else {
        socket.emit('auth-error', { message: 'Thiếu hoặc token không hợp lệ cho kết nối realtime' });
      }

      this.registerSupportChatEvents(socket);
      this.registerFriendChatEvents(socket, authUser);

      // Handle disconnect
      socket.on('disconnect', () => {
        logger.info(`🔌 Socket disconnected: ${socket.id}`);
      });
    });
  }

  private extractAuthUser(socket: Socket): SocketAuthPayload | null {
    const token = (socket.handshake.auth && socket.handshake.auth.token)
      || (typeof socket.handshake.query?.token === 'string' ? socket.handshake.query.token : undefined)
      || this.extractTokenFromHeader(socket.handshake.headers?.authorization as string | undefined);

    if (!token) {
      return null;
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET as string) as SocketAuthPayload;
      return decoded?.userId ? decoded : null;
    } catch (error) {
      logger.warn('Socket auth failed:', error);
      return null;
    }
  }

  private extractTokenFromHeader(header?: string) {
    if (!header) return undefined;
    if (header.startsWith('Bearer ')) {
      return header.substring(7);
    }
    return header;
  }

  private registerSupportChatEvents(socket: Socket) {
    socket.on('support-chat:join', async (payload) => {
      try {
        const parsed = await supportChatJoinSchema.parseAsync(payload);
        logger.info(`💬 Support chat join for user ${parsed.userId}`);
        socket.join(`support-chat:user:${parsed.userId}`);
      } catch (err: any) {
        logger.warn('support-chat:join validation failed:', err?.errors || err?.message || err);
        socket.emit('validation-error', { event: 'support-chat:join', errors: err?.errors || [{ message: err?.message || 'Invalid payload' }] });
      }
    });

    socket.on('support-chat:leave', async (payload) => {
      try {
        const parsed = await supportChatJoinSchema.parseAsync(payload);
        logger.info(`💬 Support chat leave for user ${parsed.userId}`);
        socket.leave(`support-chat:user:${parsed.userId}`);
      } catch (err: any) {
        logger.warn('support-chat:leave validation failed:', err?.errors || err?.message || err);
        socket.emit('validation-error', { event: 'support-chat:leave', errors: err?.errors || [{ message: err?.message || 'Invalid payload' }] });
      }
    });

    socket.on('support-chat:join-admin', async (payload) => {
      try {
        const parsed = await supportChatJoinAdminSchema.parseAsync(payload);
        logger.info(`💬 Support chat admin join ${parsed.adminId || 'unknown'}`);
        socket.join('support-chat:admins');
        if (parsed.adminId) {
          socket.join(`support-chat:admin:${parsed.adminId}`);
        }
      } catch (err: any) {
        logger.warn('support-chat:join-admin validation failed:', err?.errors || err?.message || err);
        socket.emit('validation-error', { event: 'support-chat:join-admin', errors: err?.errors || [{ message: err?.message || 'Invalid payload' }] });
      }
    });
  }

  private registerFriendChatEvents(socket: Socket, authUser: SocketAuthPayload | null) {
    socket.on('friend-chat:join-thread', (payload) => {
      if (!authUser || !payload?.threadId) return;
      socket.join(`friend-chat:thread:${payload.threadId}`);
    });

    socket.on('friend-chat:leave-thread', (payload) => {
      if (!authUser || !payload?.threadId) return;
      socket.leave(`friend-chat:thread:${payload.threadId}`);
    });

    socket.on('friend-chat:typing', (payload) => {
      if (!authUser || !payload?.threadId) return;
      const data = {
        threadId: payload.threadId,
        userId: authUser.userId,
        isTyping: !!payload?.isTyping
      };
      socket.to(`friend-chat:thread:${payload.threadId}`).emit('friend-chat:typing', data);
    });
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}
