"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.resendVerificationSchema = exports.refreshSchema = exports.changePasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Email không hợp lệ'),
        password: zod_1.z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
        confirmPassword: zod_1.z.string().min(6, 'Xác nhận mật khẩu tối thiểu 6 ký tự'),
        userName: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        date_of_birth: zod_1.z.preprocess(arg => (typeof arg === 'string' ? new Date(arg) : arg), zod_1.z.date().optional()),
        address: zod_1.z.any().optional()
    }).refine((data) => data.password === data.confirmPassword, {
        message: 'Mật khẩu xác nhận không khớp',
        path: ['confirmPassword']
    })
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Email không hợp lệ'),
        password: zod_1.z.string().min(1, 'Mật khẩu là bắt buộc')
    })
});
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),
        newPassword: zod_1.z.string().min(6, 'Mật khẩu mới tối thiểu 6 ký tự')
    })
});
exports.refreshSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1, 'Refresh token là bắt buộc')
    })
});
exports.resendVerificationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Email không hợp lệ')
    })
});
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z.string().min(1, 'Reset token là bắt buộc'),
        newPassword: zod_1.z.string().min(6, 'Mật khẩu mới tối thiểu 6 ký tự')
    })
});
