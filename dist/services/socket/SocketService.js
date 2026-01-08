"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const logger_1 = require("../../shared/utils/logger");
const socket_schema_1 = require("../../shared/validation/socket.schema");
class SocketService {
    constructor(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: true,
                credentials: true,
                methods: ['GET', 'POST']
            }
        });
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            logger_1.logger.info(`🔌 Socket connected: ${socket.id}`);
            socket.on('support-chat:join', async (payload) => {
                try {
                    const parsed = await socket_schema_1.supportChatJoinSchema.parseAsync(payload);
                    logger_1.logger.info(`💬 Support chat join for user ${parsed.userId}`);
                    socket.join(`support-chat:user:${parsed.userId}`);
                }
                catch (err) {
                    logger_1.logger.warn('support-chat:join validation failed:', err?.errors || err?.message || err);
                    socket.emit('validation-error', { event: 'support-chat:join', errors: err?.errors || [{ message: err?.message || 'Invalid payload' }] });
                }
            });
            socket.on('support-chat:leave', async (payload) => {
                try {
                    const parsed = await socket_schema_1.supportChatJoinSchema.parseAsync(payload);
                    logger_1.logger.info(`💬 Support chat leave for user ${parsed.userId}`);
                    socket.leave(`support-chat:user:${parsed.userId}`);
                }
                catch (err) {
                    logger_1.logger.warn('support-chat:leave validation failed:', err?.errors || err?.message || err);
                    socket.emit('validation-error', { event: 'support-chat:leave', errors: err?.errors || [{ message: err?.message || 'Invalid payload' }] });
                }
            });
            socket.on('support-chat:join-admin', async (payload) => {
                try {
                    const parsed = await socket_schema_1.supportChatJoinAdminSchema.parseAsync(payload);
                    logger_1.logger.info(`💬 Support chat admin join ${parsed.adminId || 'unknown'}`);
                    socket.join('support-chat:admins');
                    if (parsed.adminId) {
                        socket.join(`support-chat:admin:${parsed.adminId}`);
                    }
                }
                catch (err) {
                    logger_1.logger.warn('support-chat:join-admin validation failed:', err?.errors || err?.message || err);
                    socket.emit('validation-error', { event: 'support-chat:join-admin', errors: err?.errors || [{ message: err?.message || 'Invalid payload' }] });
                }
            });
            // Handle disconnect
            socket.on('disconnect', () => {
                logger_1.logger.info(`🔌 Socket disconnected: ${socket.id}`);
            });
        });
    }
    getIO() {
        return this.io;
    }
}
exports.SocketService = SocketService;
