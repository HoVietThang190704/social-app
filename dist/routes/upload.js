"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRoutes = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const auth_middleware_1 = require("../shared/middleware/auth.middleware");
const httpStatus_1 = require("../shared/constants/httpStatus");
const cloudinary_service_1 = require("../services/cloudinary.service");
const uploadValidate_1 = require("../shared/middleware/uploadValidate");
const router = (0, express_1.Router)();
exports.uploadRoutes = router;
// Configure multer for memory storage (upload to Cloudinary)
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
    fileFilter: (req, file, cb) => {
        // Only allow image files. Prefer checking mimetype startsWith('image/'),
        // but keep extension fallback for odd clients.
        try {
            const allowedTypes = /(jpeg|jpg|jfif|png|gif|webp)/;
            const orig = String(file.originalname || '');
            const ext = path_1.default.extname(orig).toLowerCase().replace(/^\./, '');
            const mimetype = String(file.mimetype || '');
            // Debug log to help diagnose unexpected uploads
            console.debug('[upload] fileFilter:', { originalname: orig, mimetype, ext });
            const isImageMime = mimetype.startsWith('image/');
            const isAllowedExt = allowedTypes.test(ext);
            if (isImageMime || isAllowedExt) {
                return cb(null, true);
            }
            cb(new Error('Only image files are allowed!'));
        }
        catch (err) {
            // If anything surprising happens, reject the file and log
            console.error('[upload] fileFilter error', err);
            cb(new Error('Only image files are allowed!'));
        }
    }
});
const videoUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        try {
            const allowedTypes = /(mp4|mov|m4v|avi|mkv|wmv|flv|3gp)/;
            const orig = String(file.originalname || '');
            const ext = path_1.default.extname(orig).toLowerCase().replace(/^\./, '');
            const mimetype = String(file.mimetype || '');
            const isVideoMime = mimetype.startsWith('video/');
            const isAllowedExt = allowedTypes.test(ext);
            if (isVideoMime || isAllowedExt) {
                return cb(null, true);
            }
            cb(new Error('Only video files are allowed!'));
        }
        catch (err) {
            console.error('[upload] video fileFilter error', err);
            cb(new Error('Only video files are allowed!'));
        }
    }
});
/**
 * @swagger
 * /api/upload/images:
 *   post:
 *     tags: [Upload]
 *     summary: Upload ảnh lên Cloudinary
 *     description: Upload nhiều ảnh (tối đa 10 ảnh, mỗi ảnh tối đa 10MB)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Upload thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     urls:
 *                       type: array
 *                       items:
 *                         type: string
 *                     publicIds:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.post('/images', auth_middleware_1.authMiddleware, upload.array('images', 10), (0, uploadValidate_1.requireFiles)('images', 1, 10), async (req, res) => {
    try {
        const files = req.files;
        // Log origin and filenames to aid debugging when running in production
        console.info('[upload] origin:', req.headers.origin || 'none', 'files:', files.map(f => f.originalname));
        // Upload to Cloudinary
        const uploadResults = await cloudinary_service_1.CloudinaryService.uploadMultipleImages(files, 'posts');
        const urls = uploadResults.map(result => result.url);
        const publicIds = uploadResults.map(result => result.publicId);
        res.status(httpStatus_1.HttpStatus.OK).json({
            success: true,
            data: {
                urls,
                publicIds
            }
        });
    }
    catch (error) {
        console.error('Error uploading images:', error);
        res.status(httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || 'Failed to upload images'
        });
    }
});
router.post('/videos', auth_middleware_1.authMiddleware, videoUpload.array('videos', 2), (0, uploadValidate_1.requireFiles)('videos', 1, 2), async (req, res) => {
    try {
        const files = req.files;
        console.info('[upload] video origin:', req.headers.origin || 'none', 'files:', files.map(f => f.originalname));
        const uploadResults = await cloudinary_service_1.CloudinaryService.uploadMultipleVideos(files, 'posts/videos');
        const urls = uploadResults.map(result => result.url);
        const publicIds = uploadResults.map(result => result.publicId);
        res.status(httpStatus_1.HttpStatus.OK).json({
            success: true,
            data: {
                urls,
                publicIds
            }
        });
    }
    catch (error) {
        console.error('Error uploading videos:', error);
        res.status(httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || 'Failed to upload videos'
        });
    }
});
/**
 * @swagger
 * /api/upload/images/{publicId}:
 *   delete:
 *     tags: [Upload]
 *     summary: Xóa ảnh trên Cloudinary
 *     description: Xóa ảnh đã upload (cần encode publicId)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Public ID của ảnh (encode URL)
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/images/:publicId', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { publicId } = req.params;
        // Decode publicId (it might be URL encoded)
        const decodedPublicId = decodeURIComponent(publicId);
        // Delete from Cloudinary
        await cloudinary_service_1.CloudinaryService.deleteImage(decodedPublicId);
        res.status(httpStatus_1.HttpStatus.OK).json({
            success: true,
            message: 'Image deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting image:', error);
        res.status(httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || 'Failed to delete image'
        });
    }
});
router.delete('/videos/:publicId', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const decodedPublicId = decodeURIComponent(req.params.publicId);
        await cloudinary_service_1.CloudinaryService.deleteVideo(decodedPublicId);
        res.status(httpStatus_1.HttpStatus.OK).json({
            success: true,
            message: 'Video deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting video:', error);
        res.status(httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || 'Failed to delete video'
        });
    }
});
