import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.object({
    content: z.string().max(5000).optional(),
    images: z.array(z.string().url()).optional(),
    cloudinaryPublicIds: z.array(z.string()).optional(),
    visibility: z.enum(['public', 'private', 'friends']).optional()
  }).refine(data => (data.content && data.content.trim().length > 0) || (data.images && data.images.length > 0) || (data.cloudinaryPublicIds && data.cloudinaryPublicIds.length > 0), { message: 'Cần nội dung hoặc ít nhất một ảnh' })
});

export const updatePostSchema = z.object({
  body: z.object({
    content: z.string().max(5000).optional(),
    images: z.array(z.string().url()).optional(),
    cloudinaryPublicIds: z.array(z.string()).optional(),
    visibility: z.enum(['public', 'private', 'friends']).optional()
  }).refine(data => Object.keys(data).length > 0, { message: 'Cần ít nhất một trường để cập nhật' })
});

export const sharePostSchema = z.object({
  body: z.object({
    content: z.string().max(5000).optional()
  })
});

// Schema intended to validate domain Post entities
export const postEntitySchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1, 'User ID không được để trống'),
  content: z.string().min(1, 'Nội dung bài viết không được để trống').max(10000, 'Nội dung bài viết không được vượt quá 10,000 ký tự'),
  images: z.array(z.string().url()).optional(),
  cloudinaryPublicIds: z.array(z.string()).optional(),
  likes: z.array(z.string()).optional(),
  likesCount: z.number().nonnegative().optional(),
  commentsCount: z.number().nonnegative().optional(),
  sharesCount: z.number().nonnegative().optional(),
  visibility: z.enum(['public', 'friends', 'private']),
  isEdited: z.boolean().optional(),
  editedAt: z.date().optional(),
  originalPostId: z.string().optional(),
  sharedBy: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
}).superRefine((data, ctx) => {
  const imagesLen = (data.images ?? []).length;
  const idsLen = (data.cloudinaryPublicIds ?? []).length;
  if (imagesLen > 10) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Số lượng hình ảnh không được vượt quá 10' });
  }
  if (imagesLen !== idsLen) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Số lượng hình ảnh và public IDs không khớp' });
  }
});