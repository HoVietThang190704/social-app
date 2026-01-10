"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const logger_1 = require("../../shared/utils/logger");
const socket_schema_1 = require("../../shared/validation/socket.schema");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config");
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
            const authUser = this.extractAuthUser(socket);
            if (authUser) {
                socket.data.user = authUser;
                socket.join(`friend-chat:user:${authUser.userId}`);
                socket.emit('friend-chat:ready', { userId: authUser.userId });
            }
            else {
                socket.emit('auth-error', { message: 'Thiếu hoặc token không hợp lệ cho kết nối realtime' });
            }
            this.registerSupportChatEvents(socket);
            this.registerFriendChatEvents(socket, authUser);
            // Handle disconnect
            socket.on('disconnect', () => {
                logger_1.logger.info(`🔌 Socket disconnected: ${socket.id}`);
            });
        });
    }
    extractAuthUser(socket) {
        const token = (socket.handshake.auth && socket.handshake.auth.token)
            || (typeof socket.handshake.query?.token === 'string' ? socket.handshake.query.token : undefined)
            || this.extractTokenFromHeader(socket.handshake.headers?.authorization);
        if (!token) {
            return null;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.JWT_SECRET);
            return decoded?.userId ? decoded : null;
        }
        catch (error) {
            logger_1.logger.warn('Socket auth failed:', error);
            return null;
        }
    }
    extractTokenFromHeader(header) {
        if (!header)
            return undefined;
        if (header.startsWith('Bearer ')) {
            return header.substring(7);
        }
        return header;
    }
    registerSupportChatEvents(socket) {
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
    }
    registerFriendChatEvents(socket, authUser) {
        socket.on('friend-chat:join-thread', (payload) => {
            if (!authUser || !payload?.threadId)
                return;
            socket.join(`friend-chat:thread:${payload.threadId}`);
        });
        socket.on('friend-chat:leave-thread', (payload) => {
            if (!authUser || !payload?.threadId)
                return;
            socket.leave(`friend-chat:thread:${payload.threadId}`);
        });
        socket.on('friend-chat:typing', (payload) => {
            if (!authUser || !payload?.threadId)
                return;
            const data = {
                threadId: payload.threadId,
                userId: authUser.userId,
                isTyping: !!payload?.isTyping
            };
            socket.to(`friend-chat:thread:${payload.threadId}`).emit('friend-chat:typing', data);
        });
    }
    getIO() {
        return this.io;
    }
}
exports.SocketService = SocketService;
