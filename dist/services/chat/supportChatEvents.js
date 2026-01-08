"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitSupportChatThreadUpdate = exports.emitSupportChatMessage = void 0;
const socketManager_1 = require("../socket/socketManager");
const logger_1 = require("../../shared/utils/logger");
const buildThreadSummary = (thread) => ({
    threadId: thread.id,
    userId: thread.userId,
    userEmail: thread.userEmail,
    userName: thread.userName,
    userAvatar: thread.userAvatar,
    lastMessage: thread.lastMessage,
    lastSender: thread.lastSender,
    lastMessageAt: thread.lastMessageAt,
    unreadByAdmin: thread.unreadByAdmin,
    unreadByUser: thread.unreadByUser
});
const emitSupportChatMessage = (thread, message) => {
    try {
        const io = (0, socketManager_1.getIO)();
        const summary = buildThreadSummary(thread);
        io.to(`support-chat:user:${thread.userId}`).emit('support-chat:new-message', {
            summary,
            message
        });
        io.to('support-chat:admins').emit('support-chat:new-message', {
            summary,
            message
        });
    }
    catch (error) {
        logger_1.logger.error('emitSupportChatMessage error:', error);
    }
};
exports.emitSupportChatMessage = emitSupportChatMessage;
const emitSupportChatThreadUpdate = (thread) => {
    try {
        const io = (0, socketManager_1.getIO)();
        const summary = buildThreadSummary(thread);
        io.to(`support-chat:user:${thread.userId}`).emit('support-chat:thread-update', summary);
        io.to('support-chat:admins').emit('support-chat:thread-update', summary);
    }
    catch (error) {
        logger_1.logger.error('emitSupportChatThreadUpdate error:', error);
    }
};
exports.emitSupportChatThreadUpdate = emitSupportChatThreadUpdate;
