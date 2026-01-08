"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../shared/middleware/auth");
const NotificationController_1 = require("../presentation/controllers/NotificationController");
const validate_1 = require("../shared/middleware/validate");
const notification_schema_1 = require("../shared/validation/notification.schema");
const router = (0, express_1.Router)();
/**
 * @openapi
 * /api/notifications/send:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Send a notification (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               audience:
 *                 type: string
 *                 enum: [user, all_users]
 *               targetId:
 *                 type: string
 *               type:
 *                 type: string
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               payload:
 *                 type: object
 *           example:
 *             audience: user
 *             targetId: 64f3a9b5e8b4c2a1d2e3f4a5
 *             title: "Test notification"
 *             message: "You have a new message"
 *     responses:
 *       200:
 *         description: Notification sent
 */
router.post('/send', auth_1.authenticate, (0, auth_1.authorize)('admin'), (0, validate_1.validate)(notification_schema_1.sendNotificationSchema), (req, res) => NotificationController_1.notificationController.send(req, res));
/**
 * @openapi
 * /api/notifications/broadcast:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Broadcast a notification to all users or all shops (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               audience:
 *                 type: string
 *                 enum: [all_users]
 *               type:
 *                 type: string
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               payload:
 *                 type: object
 *           example:
 *             audience: all_users
 *             title: "System maintenance"
 *             message: "The system will be down for maintenance at 2 AM"
 *     responses:
 *       200:
 *         description: Broadcast sent
 */
router.post('/broadcast', auth_1.authenticate, (0, auth_1.authorize)('admin'), (0, validate_1.validate)(notification_schema_1.broadcastNotificationSchema), (req, res) => NotificationController_1.notificationController.broadcast(req, res));
/**
 * @openapi
 * /api/notifications:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Get notifications for current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Page size (default 10, max 100)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, read, unread]
 *         description: Filter notifications by read status
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: (Admin only) View notifications of specific user
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/', auth_1.authenticate, (req, res) => NotificationController_1.notificationController.list(req, res));
/**
 * @openapi
 * /api/notifications/summary:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Get notification summary for current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary with unread count
 */
router.get('/summary', auth_1.authenticate, (req, res) => NotificationController_1.notificationController.summary(req, res));
/**
 * @openapi
 * /api/notifications/{id}/read:
 *   patch:
 *     tags:
 *       - Notifications
 *     summary: Mark a notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.patch('/:id/read', auth_1.authenticate, (req, res) => NotificationController_1.notificationController.markRead(req, res));
/**
 * @openapi
 * /api/notifications/read-all:
 *   patch:
 *     tags:
 *       - Notifications
 *     summary: Mark all notifications as read for current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Number of notifications updated
 */
router.patch('/read-all', auth_1.authenticate, (req, res) => NotificationController_1.notificationController.markAllRead(req, res));
exports.default = router;
