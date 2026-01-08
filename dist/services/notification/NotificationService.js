"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const Notification_1 = require("../../models/Notification");
const User_1 = require("../../models/users/User");
const socketManager_1 = require("../socket/socketManager");
const logger_1 = require("../../shared/utils/logger");
const mongoose_1 = __importDefault(require("mongoose"));
class NotificationService {
    normalizeObjectId(value) {
        if (!value) {
            return null;
        }
        if (value instanceof mongoose_1.default.Types.ObjectId) {
            return value;
        }
        if (mongoose_1.default.Types.ObjectId.isValid(value)) {
            return new mongoose_1.default.Types.ObjectId(value);
        }
        return null;
    }
    mapNotification(doc) {
        if (!doc) {
            return null;
        }
        return {
            id: String(doc._id),
            userId: String(doc.userId),
            type: doc.type || 'system',
            title: doc.title,
            message: doc.message,
            payload: doc.payload ?? null,
            isRead: Boolean(doc.isRead),
            readAt: doc.readAt ?? null,
            createdAt: doc.createdAt,
        };
    }
    // For simplicity: persist only when audience === 'user' (single user)
    async send(input) {
        try {
            const io = (0, socketManager_1.getIO)();
            const notificationDto = {
                id: `notif_${Date.now()}`,
                type: input.type || 'system',
                title: input.title,
                message: input.message,
                payload: input.payload || null,
                createdAt: new Date().toISOString()
            };
            if (input.audience === 'user' && input.targetId) {
                // persist to DB for user
                const doc = await Notification_1.Notification.create({
                    userId: new mongoose_1.default.Types.ObjectId(input.targetId),
                    type: input.type,
                    title: input.title,
                    message: input.message,
                    payload: input.payload || null
                });
                const dto = { id: doc._id.toString(), title: doc.title, message: doc.message, payload: doc.payload, createdAt: doc.createdAt };
                io.to(`user:${input.targetId}`).emit('notification', dto);
                return dto;
            }
            // broadcasts to all users are supported
            if (input.audience === 'all_users') {
                try {
                    // find customers and create persistent notifications for each, then emit
                    const customers = await User_1.User.find({ role: 'customer' }).select('_id').lean();
                    if (!customers || customers.length === 0)
                        return { ...notificationDto, sentTo: 0 };
                    const docs = customers.map((c) => ({
                        userId: c._id,
                        type: input.type || 'system',
                        title: input.title,
                        message: input.message,
                        payload: input.payload || null,
                    }));
                    // batch insert so offline users can see the notification later
                    const inserted = await Notification_1.Notification.insertMany(docs);
                    // emit each saved doc to the user's room (include the assigned _id and createdAt)
                    for (const doc of inserted) {
                        try {
                            const dto = { id: String(doc._id), title: doc.title, message: doc.message, payload: doc.payload, createdAt: doc.createdAt };
                            io.to(`user:${String(doc.userId)}`).emit('notification', dto);
                        }
                        catch (e) {
                            logger_1.logger.warn('NotificationService: emit to user room failed for ' + String(doc.userId), e);
                        }
                    }
                    return { ...notificationDto, sentTo: inserted.length, persisted: inserted.length };
                }
                catch (e) {
                    logger_1.logger.error('NotificationService.all_users error', e);
                    return null;
                }
            }
            logger_1.logger.warn('NotificationService.send: invalid audience or missing targetId');
            return null;
        }
        catch (err) {
            logger_1.logger.error('NotificationService.send error:', err);
            return null;
        }
    }
    async listUserNotifications(options) {
        const page = Math.max(1, options.page ?? 1);
        const limit = Math.min(100, Math.max(5, options.limit ?? 10));
        const targetId = options.role === 'admin' && options.targetUserId ? options.targetUserId : options.userId;
        const normalizedUserId = this.normalizeObjectId(targetId);
        if (!normalizedUserId) {
            throw new Error('Invalid user identifier');
        }
        const baseQuery = { userId: normalizedUserId };
        const listQuery = { ...baseQuery };
        if (options.status === 'read') {
            listQuery.isRead = true;
        }
        if (options.status === 'unread') {
            listQuery.isRead = false;
        }
        const skip = (page - 1) * limit;
        const [docs, total, unreadCount] = await Promise.all([
            Notification_1.Notification.find(listQuery).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Notification_1.Notification.countDocuments(listQuery),
            Notification_1.Notification.countDocuments({ ...baseQuery, isRead: false }),
        ]);
        const items = docs.map((doc) => this.mapNotification(doc)).filter(Boolean);
        const totalPages = total > 0 ? Math.ceil(total / limit) : 1;
        return {
            items,
            meta: {
                page,
                limit,
                total,
                totalPages,
                unreadCount,
            },
        };
    }
    async markAsRead(userId, notificationId) {
        const normalizedUserId = this.normalizeObjectId(userId);
        const normalizedNotificationId = this.normalizeObjectId(notificationId);
        if (!normalizedUserId || !normalizedNotificationId) {
            throw new Error('Invalid identifier supplied');
        }
        const updated = await Notification_1.Notification.findOneAndUpdate({ _id: normalizedNotificationId, userId: normalizedUserId }, { $set: { isRead: true, readAt: new Date() } }, { new: true }).lean();
        return this.mapNotification(updated);
    }
    async markAllAsRead(userId) {
        const normalizedUserId = this.normalizeObjectId(userId);
        if (!normalizedUserId) {
            throw new Error('Invalid user identifier');
        }
        const result = await Notification_1.Notification.updateMany({ userId: normalizedUserId, isRead: false }, { $set: { isRead: true, readAt: new Date() } });
        return (result && 'modifiedCount' in result ? result.modifiedCount : result?.nModified) || 0;
    }
    async getSummary(userId) {
        const normalizedUserId = this.normalizeObjectId(userId);
        if (!normalizedUserId) {
            throw new Error('Invalid user identifier');
        }
        const [total, unread, latest, latestUnread] = await Promise.all([
            Notification_1.Notification.countDocuments({ userId: normalizedUserId }),
            Notification_1.Notification.countDocuments({ userId: normalizedUserId, isRead: false }),
            Notification_1.Notification.findOne({ userId: normalizedUserId }).sort({ createdAt: -1 }).lean(),
            Notification_1.Notification.findOne({ userId: normalizedUserId, isRead: false }).sort({ createdAt: -1 }).lean(),
        ]);
        return {
            total,
            unread,
            hasUnread: unread > 0,
            latestNotification: this.mapNotification(latest),
            latestUnreadAt: latestUnread?.createdAt ?? null,
        };
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
