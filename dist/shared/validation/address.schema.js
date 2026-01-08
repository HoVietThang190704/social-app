"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAddressSchema = exports.createAddressSchema = void 0;
const zod_1 = require("zod");
exports.createAddressSchema = zod_1.z.object({
    body: zod_1.z.object({
        recipientName: zod_1.z.string().min(1, 'Tên người nhận không được để trống'),
        phone: zod_1.z.string().regex(/^(\+84|84|0)[1-9][0-9]{8}$/, 'Số điện thoại không hợp lệ'),
        address: zod_1.z.string().min(1, 'Địa chỉ không được để trống'),
        ward: zod_1.z.string().min(1, 'Phường/Xã không được để trống'),
        district: zod_1.z.string().min(1, 'Quận/Huyện không được để trống'),
        province: zod_1.z.string().min(1, 'Tỉnh/Thành phố không được để trống'),
        isDefault: zod_1.z.boolean().optional(),
        label: zod_1.z.string().optional(),
        note: zod_1.z.string().optional()
    })
});
exports.updateAddressSchema = zod_1.z.object({
    body: zod_1.z.object({
        recipientName: zod_1.z.string().min(1).optional(),
        phone: zod_1.z.string().regex(/^(\+84|84|0)[1-9][0-9]{8}$/, 'Số điện thoại không hợp lệ').optional(),
        address: zod_1.z.string().min(1).optional(),
        ward: zod_1.z.string().min(1).optional(),
        district: zod_1.z.string().min(1).optional(),
        province: zod_1.z.string().min(1).optional(),
        label: zod_1.z.string().optional(),
        note: zod_1.z.string().optional()
    }).refine(data => Object.keys(data).length > 0, { message: 'Cần ít nhất một trường để cập nhật' })
});
