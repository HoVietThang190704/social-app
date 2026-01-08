import { z } from 'zod';

export const sendNotificationSchema = z.object({
  body: z.object({
    audience: z.enum(['user', 'all_users']),
    targetId: z.string().optional(),
    type: z.string().optional(),
    title: z.string().min(1),
    message: z.string().min(1),
    payload: z.any().optional()
  })
});

export const broadcastNotificationSchema = z.object({
  body: z.object({
    audience: z.literal('all_users'),
    type: z.string().optional(),
    title: z.string().min(1),
    message: z.string().min(1),
    payload: z.any().optional()
  })
});