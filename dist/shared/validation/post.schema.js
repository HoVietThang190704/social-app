"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postEntitySchema = exports.sharePostSchema = exports.updatePostSchema = exports.createPostSchema = void 0;
const zod_1 = require("zod");
exports.createPostSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().max(5000).optional(),
        images: zod_1.z.array(zod_1.z.string().url()).optional(),
        cloudinaryPublicIds: zod_1.z.array(zod_1.z.string()).optional(),
        videos: zod_1.z.array(zod_1.z.string().url()).optional(),
        videoPublicIds: zod_1.z.array(zod_1.z.string()).optional(),
        visibility: zod_1.z.enum(['public', 'private', 'friends']).optional()
    }).refine(data => (data.content && data.content.trim().length > 0)
        || (data.images && data.images.length > 0)
        || (data.videos && data.videos.length > 0), { message: 'Cần nội dung hoặc ít nhất một ảnh hoặc video' })
});
exports.updatePostSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().max(5000).optional(),
        images: zod_1.z.array(zod_1.z.string().url()).optional(),
        cloudinaryPublicIds: zod_1.z.array(zod_1.z.string()).optional(),
        videos: zod_1.z.array(zod_1.z.string().url()).optional(),
        videoPublicIds: zod_1.z.array(zod_1.z.string()).optional(),
        visibility: zod_1.z.enum(['public', 'private', 'friends']).optional()
    }).refine(data => Object.keys(data).length > 0, { message: 'Cần ít nhất một trường để cập nhật' })
});
exports.sharePostSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().max(5000).optional()
    })
});
// Schema intended to validate domain Post entities
exports.postEntitySchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    userId: zod_1.z.string().min(1, 'User ID không được để trống'),
    content: zod_1.z.string().min(1, 'Nội dung bài viết không được để trống').max(10000, 'Nội dung bài viết không được vượt quá 10,000 ký tự'),
    images: zod_1.z.array(zod_1.z.string().url()).optional(),
    cloudinaryPublicIds: zod_1.z.array(zod_1.z.string()).optional(),
    videos: zod_1.z.array(zod_1.z.string().url()).optional(),
    videoPublicIds: zod_1.z.array(zod_1.z.string()).optional(),
    likes: zod_1.z.array(zod_1.z.string()).optional(),
    likesCount: zod_1.z.number().nonnegative().optional(),
    commentsCount: zod_1.z.number().nonnegative().optional(),
    sharesCount: zod_1.z.number().nonnegative().optional(),
    visibility: zod_1.z.enum(['public', 'friends', 'private']),
    isEdited: zod_1.z.boolean().optional(),
    editedAt: zod_1.z.date().optional(),
    originalPostId: zod_1.z.string().optional(),
    sharedBy: zod_1.z.string().optional(),
    createdAt: zod_1.z.date().optional(),
    updatedAt: zod_1.z.date().optional()
}).superRefine((data, ctx) => {
    const imagesLen = (data.images ?? []).length;
    const idsLen = (data.cloudinaryPublicIds ?? []).length;
    const videosLen = (data.videos ?? []).length;
    const videoIdsLen = (data.videoPublicIds ?? []).length;
    if (imagesLen > 10) {
        ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, message: 'Số lượng hình ảnh không được vượt quá 10' });
    }
    if (imagesLen !== idsLen) {
        ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, message: 'Số lượng hình ảnh và public IDs không khớp' });
    }
    if (videosLen > 2) {
        ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, message: 'Số lượng video không được vượt quá 2' });
    }
    if (videosLen !== videoIdsLen) {
        ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, message: 'Số lượng video và public IDs không khớp' });
    }
});
