"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lockUserSchema = exports.adminUpdateUserSchema = void 0;
const zod_1 = require("zod");
exports.adminUpdateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        userName: zod_1.z.string().min(1).optional(),
        phone: zod_1.z.string().optional(),
        dateOfBirth: zod_1.z.preprocess(arg => (typeof arg === 'string' ? new Date(arg) : arg), zod_1.z.date().optional()).optional(),
        avatar: zod_1.z.string().url().optional(),
        address: zod_1.z.any().optional(),
        role: zod_1.z.string().optional(),
        isVerified: zod_1.z.boolean().optional()
    }).refine(data => Object.keys(data).length > 0, { message: 'Cần ít nhất một trường để cập nhật' })
});
exports.lockUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        lock: zod_1.z.boolean()
    })
});
