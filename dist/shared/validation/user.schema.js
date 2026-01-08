"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
// Schema for updating user profile
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        userName: zod_1.z.string()
            .min(1, "Tên người dùng không được để trống")
            .max(50, "Tên người dùng không được vượt quá 50 ký tự")
            .optional(),
        phone: zod_1.z.string()
            .regex(/^(\+84|84|0)[1-9][0-9]{8}$/, "Số điện thoại không hợp lệ")
            .optional(),
        date_of_birth: zod_1.z.string()
            .datetime({ message: "Định dạng ngày sinh không hợp lệ" })
            .or(zod_1.z.date())
            .optional(),
        avatar: zod_1.z.string()
            .url("URL avatar không hợp lệ")
            .or(zod_1.z.null())
            .optional(),
        address: zod_1.z.object({
            province: zod_1.z.string().optional(),
            district: zod_1.z.string().optional(),
            commune: zod_1.z.string().optional(),
            street: zod_1.z.string().optional(),
            detail: zod_1.z.string().optional(),
        }).optional()
            .or(zod_1.z.null()),
    }).refine((data) => Object.keys(data).length > 0, {
        message: "Cần ít nhất một trường để cập nhật"
    })
});
