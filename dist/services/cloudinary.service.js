"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const cloudinary_1 = require("cloudinary");
const config_1 = require("../config");
const logger_1 = require("../shared/utils/logger");
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: config_1.config.CLOUDINARY_CLOUD_NAME,
    api_key: config_1.config.CLOUDINARY_API_KEY,
    api_secret: config_1.config.CLOUDINARY_API_SECRET,
    secure: true
});
class CloudinaryService {
    /**
     * Upload a single image to Cloudinary
     */
    static async uploadImage(buffer, folder = 'posts', publicId) {
        try {
            return new Promise((resolve, reject) => {
                const uploadOptions = {
                    folder: `fresh-food/${folder}`,
                    resource_type: 'image',
                    transformation: [
                        { width: 1200, height: 1200, crop: 'limit' }, // Max size
                        { quality: 'auto:good' }, // Auto quality
                        { fetch_format: 'auto' } // Auto format (WebP when supported)
                    ]
                };
                if (publicId) {
                    // allow passing custom public id for stable naming
                    uploadOptions.public_id = publicId;
                }
                const uploadStream = cloudinary_1.v2.uploader.upload_stream(uploadOptions, (error, result) => {
                    if (error) {
                        logger_1.logger.error('Cloudinary upload error:', error);
                        reject(error);
                    }
                    else if (result) {
                        resolve({
                            url: result.secure_url,
                            publicId: result.public_id,
                            width: result.width,
                            height: result.height,
                            format: result.format,
                            bytes: result.bytes
                        });
                    }
                    else {
                        reject(new Error('Upload failed - no result'));
                    }
                });
                uploadStream.end(buffer);
            });
        }
        catch (error) {
            logger_1.logger.error('Error uploading to Cloudinary:', error);
            throw new Error('Failed to upload image');
        }
    }
    /**
     * Upload multiple images to Cloudinary
     */
    static async uploadMultipleImages(files, folder = 'posts') {
        try {
            const uploadPromises = files.map(file => {
                // create lightweight unique public id; avoid using original filename directly
                const randomId = `${folder}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
                return this.uploadImage(file.buffer, folder, randomId);
            });
            return await Promise.all(uploadPromises);
        }
        catch (error) {
            logger_1.logger.error('Error uploading multiple images:', error);
            throw new Error('Failed to upload images');
        }
    }
    /**
     * Delete an image from Cloudinary
     */
    static async deleteImage(publicId) {
        try {
            await cloudinary_1.v2.uploader.destroy(publicId);
            logger_1.logger.info(`Deleted image: ${publicId}`);
        }
        catch (error) {
            logger_1.logger.error('Error deleting from Cloudinary:', error);
            throw new Error('Failed to delete image');
        }
    }
    /**
     * Delete multiple images from Cloudinary
     */
    static async deleteMultipleImages(publicIds) {
        try {
            const deletePromises = publicIds.map(id => this.deleteImage(id));
            await Promise.all(deletePromises);
        }
        catch (error) {
            logger_1.logger.error('Error deleting multiple images:', error);
            throw new Error('Failed to delete images');
        }
    }
    /**
     * Get optimized image URL with transformations
     */
    static getOptimizedUrl(publicId, width, height) {
        return cloudinary_1.v2.url(publicId, {
            width,
            height,
            crop: 'fill',
            gravity: 'auto',
            quality: 'auto:good',
            fetch_format: 'auto'
        });
    }
}
exports.CloudinaryService = CloudinaryService;
