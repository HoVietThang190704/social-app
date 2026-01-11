import { z } from 'zod';

const attachmentSchema = z.object({
  url: z.string().url('Đường dẫn tệp không hợp lệ'),
  type: z.string().max(50).nullable().optional(),
  name: z.string().max(255).nullable().optional()
});

export const sendMessageSchema = z.object({
  threadId: z.string().min(1).optional(),
  recipientId: z.string().min(1, 'recipientId là bắt buộc'),
  content: z.string().trim().max(4000).optional().or(z.literal('')),
  attachments: z.array(attachmentSchema).optional()
}).refine((data) => {
  const text = data.content?.trim();
  return (text && text.length > 0) || (Array.isArray(data.attachments) && data.attachments.length > 0);
}, {
  message: 'Vui lòng nhập nội dung hoặc đính kèm tệp',
  path: ['content']
});

export const markThreadReadSchema = z.object({
  body: z.record(z.string(), z.any()).optional(),
  params: z.object({
    threadId: z.string().min(1, 'threadId là bắt buộc')
  })
});

export const createGroupSchema = z.object({
  name: z.string().min(1, 'Tên nhóm là bắt buộc').max(200),
  memberIds: z.array(z.string().min(1)).optional(),
  avatar: z.string().url().optional().nullable()
});
