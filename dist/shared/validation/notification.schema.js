"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastNotificationSchema = exports.sendNotificationSchema = void 0;
const zod_1 = require("zod");
exports.sendNotificationSchema = zod_1.z.object({
    body: zod_1.z.object({
        audience: zod_1.z.enum(['user', 'all_users']),
        targetId: zod_1.z.string().optional(),
        type: zod_1.z.string().optional(),
        title: zod_1.z.string().min(1),
        message: zod_1.z.string().min(1),
        payload: zod_1.z.any().optional()
    })
});
exports.broadcastNotificationSchema = zod_1.z.object({
    body: zod_1.z.object({
        audience: zod_1.z.literal('all_users'),
        type: zod_1.z.string().optional(),
        title: zod_1.z.string().min(1),
        message: zod_1.z.string().min(1),
        payload: zod_1.z.any().optional()
    })
});
