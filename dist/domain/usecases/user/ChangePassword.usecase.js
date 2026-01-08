"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordUseCase = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class ChangePasswordUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(userId, oldPassword, newPassword) {
        if (!userId || userId.trim().length === 0) {
            throw new Error('User ID không hợp lệ');
        }
        if (!oldPassword || oldPassword.trim().length === 0) {
            throw new Error('Mật khẩu cũ không được để trống');
        }
        if (!newPassword || newPassword.length < 6) {
            throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
        }
        if (newPassword.length > 100) {
            throw new Error('Mật khẩu mới không được vượt quá 100 ký tự');
        }
        if (oldPassword === newPassword) {
            throw new Error('Mật khẩu mới phải khác mật khẩu cũ');
        }
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('Người dùng không tồn tại');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            throw new Error('Mật khẩu cũ không đúng');
        }
        const salt = await bcryptjs_1.default.genSalt(12);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        const updated = await this.userRepository.updatePassword(userId, hashedPassword);
        if (!updated) {
            throw new Error('Không thể cập nhật mật khẩu');
        }
    }
}
exports.ChangePasswordUseCase = ChangePasswordUseCase;
