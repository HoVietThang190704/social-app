import { z } from 'zod';

export const adminUpdateUserSchema = z.object({
  body: z.object({
    userName: z.string().min(1).optional(),
    phone: z.string().optional(),
    dateOfBirth: z.preprocess(arg => (typeof arg === 'string' ? new Date(arg) : arg), z.date().optional()).optional(),
    avatar: z.string().url().optional(),
    address: z.any().optional(),
    role: z.string().optional(),
    isVerified: z.boolean().optional()
  }).refine(data => Object.keys(data).length > 0, { message: 'Cần ít nhất một trường để cập nhật' })
});

export const lockUserSchema = z.object({
  body: z.object({
    lock: z.boolean()
  })
});
