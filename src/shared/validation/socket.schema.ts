import { z } from 'zod';

export const supportChatJoinSchema = z.object({
  userId: z.string().min(1)
});

export const supportChatJoinAdminSchema = z.object({
  adminId: z.string().min(1).optional()
});

export const supportChatSendMessageSchema = z.object({
  userId: z.string().min(1),
  sender: z.enum(['user', 'admin']).optional(),
  content: z.string().min(1).max(2000),
  attachments: z.array(z.object({ url: z.string().url(), filename: z.string().optional() })).optional()
});
