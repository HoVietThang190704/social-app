"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordUseCase = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../../config");
class ResetPasswordUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(token, newPassword) {
        // 1. Validate token
        if (!token || token.trim().length === 0) {
            throw new Error('Token không hợp lệ');
        }
        // 2. Validate new password
        if (!newPassword || newPassword.length < 6) {
            throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
        }
        if (newPassword.length > 100) {
            throw new Error('Mật khẩu không được vượt quá 100 ký tự');
        }
        // 3. Find user by reset token
        let user = await this.userRepository.findByResetPasswordToken(token);
        // If token not found in DB, attempt JWT verification fallback (some flows may issue JWT tokens)
        if (!user) {
            try {
                const payload = jsonwebtoken_1.default.verify(token, config_1.config.JWT_SECRET);
                const userId = payload.userId || payload.userID || payload.id || payload.sub;
                if (userId) {
                    user = await this.userRepository.findById(userId);
                }
            }
            catch (err) {
                // ignore - will throw below if still no user
            }
        }
        if (!user) {
            throw new Error('Token không hợp lệ hoặc đã hết hạn');
        }
        // 4. Hash new password
        const salt = await bcryptjs_1.default.genSalt(12);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        // 5. Update password
        const updated = await this.userRepository.updatePassword(user.id, hashedPassword);
        if (!updated) {
            throw new Error('Không thể cập nhật mật khẩu');
        }
        // 6. Clear reset token
        await this.userRepository.clearResetPasswordToken(user.id);
    }
}
exports.ResetPasswordUseCase = ResetPasswordUseCase;
