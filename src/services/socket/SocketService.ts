import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';
import { logger } from '../../shared/utils/logger';
import { supportChatJoinSchema, supportChatJoinAdminSchema } from '../../shared/validation/socket.schema';

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

      // Handle disconnect
      socket.on('disconnect', () => {
        logger.info(`🔌 Socket disconnected: ${socket.id}`);
      });
    });
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}
