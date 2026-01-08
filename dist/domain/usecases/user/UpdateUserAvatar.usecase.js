"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserAvatarUseCase = void 0;
const cloudinary_1 = require("../../../shared/utils/cloudinary");
class UpdateUserAvatarUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(userId, file) {
        // Find user
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('Không tìm thấy người dùng');
        }
        // Upload new avatar to Cloudinary
        const { url: newAvatarUrl, publicId } = await (0, cloudinary_1.uploadToCloudinary)(file, 'avatars');
        // Delete old avatar from Cloudinary if exists
        if (user.avatar && user.avatar.includes('cloudinary')) {
            // Extract public_id from old avatar URL
            const urlParts = user.avatar.split('/');
            const publicIdWithExt = urlParts.slice(-2).join('/'); // folder/filename.ext
            const oldPublicId = publicIdWithExt.split('.')[0]; // Remove extension
            await (0, cloudinary_1.deleteFromCloudinary)(oldPublicId);
        }
        // Update user avatar in database
        await this.userRepository.update(userId, { avatar: newAvatarUrl });
        return {
            avatar: newAvatarUrl,
            message: 'Cập nhật ảnh đại diện thành công'
        };
    }
}
exports.UpdateUserAvatarUseCase = UpdateUserAvatarUseCase;
