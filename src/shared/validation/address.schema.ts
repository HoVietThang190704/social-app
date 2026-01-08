import { z } from 'zod';

export const createAddressSchema = z.object({
  body: z.object({
    recipientName: z.string().min(1, 'Tên người nhận không được để trống'),
    phone: z.string().regex(/^(\+84|84|0)[1-9][0-9]{8}$/, 'Số điện thoại không hợp lệ'),
    address: z.string().min(1, 'Địa chỉ không được để trống'),
    ward: z.string().min(1, 'Phường/Xã không được để trống'),
    district: z.string().min(1, 'Quận/Huyện không được để trống'),
    province: z.string().min(1, 'Tỉnh/Thành phố không được để trống'),
    isDefault: z.boolean().optional(),
    label: z.string().optional(),
    note: z.string().optional()
  })
});

export const updateAddressSchema = z.object({
  body: z.object({
    recipientName: z.string().min(1).optional(),
    phone: z.string().regex(/^(\+84|84|0)[1-9][0-9]{8}$/, 'Số điện thoại không hợp lệ').optional(),
    address: z.string().min(1).optional(),
    ward: z.string().min(1).optional(),
    district: z.string().min(1).optional(),
    province: z.string().min(1).optional(),
    label: z.string().optional(),
    note: z.string().optional()
  }).refine(data => Object.keys(data).length > 0, { message: 'Cần ít nhất một trường để cập nhật' })
});
