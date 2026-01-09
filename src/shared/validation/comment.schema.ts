import { z } from 'zod';

const contentField = z.string().trim().min(1, 'Nội dung bình luận không được trống').max(2000, 'Bình luận tối đa 2000 ký tự');
const imagesField = z.array(z.string().trim()).max(5, 'Tối đa 5 hình ảnh').optional();

export const createCommentSchema = z.object({
  content: contentField,
  images: imagesField,
  cloudinaryPublicIds: z.array(z.string().trim()).optional(),
  mentionedUserId: z.string().trim().optional(),
});

export const replyCommentSchema = z.object({
  content: contentField,
  images: imagesField,
  cloudinaryPublicIds: z.array(z.string().trim()).optional(),
  mentionedUserId: z.string().trim().optional(),
});

export const commentEntitySchema = z.object({
  postId: z.string().trim(),
  userId: z.string().trim(),
  content: contentField,
  images: imagesField,
  cloudinaryPublicIds: z.array(z.string().trim()).optional(),
  parentCommentId: z.string().trim().nullable().optional(),
  level: z.number().min(0).max(2).optional(),
  mentionedUserId: z.string().trim().optional(),
  likes: z.array(z.string().trim()).optional(),
  likesCount: z.number().nonnegative().optional(),
  repliesCount: z.number().nonnegative().optional(),
  isEdited: z.boolean().optional(),
  editedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
