import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
    confirmPassword: z.string().min(6, 'Xác nhận mật khẩu tối thiểu 6 ký tự'),
    userName: z.string().optional(),
    phone: z.string().optional(),
    date_of_birth: z.preprocess(arg => (typeof arg === 'string' ? new Date(arg) : arg), z.date().optional()),
    address: z.any().optional()
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(1, 'Mật khẩu là bắt buộc')
  })
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),
    newPassword: z.string().min(6, 'Mật khẩu mới tối thiểu 6 ký tự')
  })
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token là bắt buộc')
  })
});

export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email('Email không hợp lệ')
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token là bắt buộc'),
    newPassword: z.string().min(6, 'Mật khẩu mới tối thiểu 6 ký tự')
  })
});
