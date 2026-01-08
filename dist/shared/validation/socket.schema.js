"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportChatSendMessageSchema = exports.supportChatJoinAdminSchema = exports.supportChatJoinSchema = void 0;
const zod_1 = require("zod");
exports.supportChatJoinSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1)
});
exports.supportChatJoinAdminSchema = zod_1.z.object({
    adminId: zod_1.z.string().min(1).optional()
});
exports.supportChatSendMessageSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1),
    sender: zod_1.z.enum(['user', 'admin']).optional(),
    content: zod_1.z.string().min(1).max(2000),
    attachments: zod_1.z.array(zod_1.z.object({ url: zod_1.z.string().url(), filename: zod_1.z.string().optional() })).optional()
});
