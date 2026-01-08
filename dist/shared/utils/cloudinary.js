"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const config_1 = require("../../config");
/**
 * Cloudinary Configuration
 */
cloudinary_1.v2.config({
    cloud_name: config_1.config.CLOUDINARY_CLOUD_NAME,
    api_key: config_1.config.CLOUDINARY_API_KEY,
    api_secret: config_1.config.CLOUDINARY_API_SECRET
});
/**
 * Upload image to Cloudinary
 */
const uploadToCloudinary = async (file, folder = 'avatars') => {
    // Generic transformation for all uploaded images
    const transformation = [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
    ];
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader.upload_stream({
            folder: `fresh-food/${folder}`,
            resource_type: 'image',
            transformation
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            else if (result) {
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id
                });
            }
            else {
                reject(new Error('Upload failed: No result returned'));
            }
        }).end(file.buffer);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
/**
 * Delete image from Cloudinary
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary_1.v2.uploader.destroy(publicId);
    }
    catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        // Don't throw error, just log it
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
exports.default = cloudinary_1.v2;
