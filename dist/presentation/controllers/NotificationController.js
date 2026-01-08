"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = exports.NotificationController = void 0;
const NotificationService_1 = require("../../services/notification/NotificationService");
const logger_1 = require("../../shared/utils/logger");
class NotificationController {
    async send(req, res) {
        try {
            const body = req.body;
            const { audience, targetId, type, title, message, payload } = body;
            if (!audience || !title || !message) {
                res.status(400).json({ success: false, message: 'Missing audience/title/message' });
                return;
            }
            const result = await NotificationService_1.notificationService.send({ audience, targetId, type, title, message, payload });
            if (!result) {
                res.status(400).json({ success: false, message: 'Failed to send notification' });
                return;
            }
            res.status(200).json({ success: true, data: result });
        }
        catch (err) {
            logger_1.logger.error('NotificationController.send error:', err);
            res.status(500).json({ success: false, message: 'Internal error' });
        }
    }
    // admin endpoint to broadcast to all users or all shops
    async broadcast(req, res) {
        try {
            const body = req.body;
            const { audience, type, title, message, payload } = body;
            if (!audience || !title || !message) {
                res.status(400).json({ success: false, message: 'Missing audience/title/message' });
                return;
            }
            if (audience !== 'all_users') {
                res.status(400).json({ success: false, message: 'Invalid audience for broadcast' });
                return;
            }
            const result = await NotificationService_1.notificationService.send({ audience, type, title, message, payload });
            if (!result) {
                res.status(400).json({ success: false, message: 'Failed to broadcast notification' });
                return;
            }
            res.status(200).json({ success: true, data: result });
        }
        catch (err) {
            logger_1.logger.error('NotificationController.broadcast error:', err);
            res.status(500).json({ success: false, message: 'Internal error' });
        }
    }
    // user endpoint to list their notifications
    async list(req, res) {
        try {
            const userId = req.user?.userId;
            const role = req.user?.role;
            if (!userId || !role) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
            const limit = Math.min(100, Math.max(5, parseInt(String(req.query.limit ?? '10'), 10)));
            const rawStatus = String(req.query.status ?? 'all').toLowerCase();
            const status = ['all', 'read', 'unread'].includes(rawStatus) ? rawStatus : 'all';
            const targetUserId = role === 'admin' ? req.query.userId : undefined;
            const result = await NotificationService_1.notificationService.listUserNotifications({
                userId,
                role,
                targetUserId,
                page,
                limit,
                status,
            });
            res.status(200).json({ success: true, data: result.items, meta: result.meta });
        }
        catch (err) {
            logger_1.logger.error('NotificationController.list error:', err);
            const status = err?.message?.toLowerCase().includes('invalid') ? 400 : 500;
            res.status(status).json({ success: false, message: err?.message || 'Internal error' });
        }
    }
    async markRead(req, res) {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const updated = await NotificationService_1.notificationService.markAsRead(userId, id);
            if (!updated) {
                res.status(404).json({ success: false, message: 'Not found' });
                return;
            }
            res.status(200).json({ success: true, data: updated });
        }
        catch (err) {
            logger_1.logger.error('NotificationController.markRead error:', err);
            const status = err?.message?.toLowerCase().includes('invalid') ? 400 : 500;
            res.status(status).json({ success: false, message: err?.message || 'Internal error' });
        }
    }
    async markAllRead(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const updated = await NotificationService_1.notificationService.markAllAsRead(userId);
            res.status(200).json({ success: true, data: { updated } });
        }
        catch (err) {
            logger_1.logger.error('NotificationController.markAllRead error:', err);
            const status = err?.message?.toLowerCase().includes('invalid') ? 400 : 500;
            res.status(status).json({ success: false, message: err?.message || 'Internal error' });
        }
    }
    async summary(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const data = await NotificationService_1.notificationService.getSummary(userId);
            res.status(200).json({ success: true, data });
        }
        catch (err) {
            logger_1.logger.error('NotificationController.summary error:', err);
            const status = err?.message?.toLowerCase().includes('invalid') ? 400 : 500;
            res.status(status).json({ success: false, message: err?.message || 'Internal error' });
        }
    }
}
exports.NotificationController = NotificationController;
exports.notificationController = new NotificationController();
