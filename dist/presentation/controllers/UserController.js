"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const logger_1 = require("../../shared/utils/logger");
class UserController {
    constructor(getUserProfileUseCase, updateUserProfileUseCase, resetPasswordUseCase, changePasswordUseCase, updateUserAvatarUseCase, lockUserUseCase) {
        this.getUserProfileUseCase = getUserProfileUseCase;
        this.updateUserProfileUseCase = updateUserProfileUseCase;
        this.resetPasswordUseCase = resetPasswordUseCase;
        this.changePasswordUseCase = changePasswordUseCase;
        this.updateUserAvatarUseCase = updateUserAvatarUseCase;
        this.lockUserUseCase = lockUserUseCase;
    }
    async getProfile(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            const user = await this.getUserProfileUseCase.execute({ userId });
            res.json({ success: true, data: user });
        }
        catch (err) {
            logger_1.logger.error('UserController.getProfile error:', err);
            res.status(500).json({ success: false, message: 'Internal error' });
        }
    }
    async getPublicProfile(req, res) {
        try {
            const userId = req.params.userId;
            const user = await this.getUserProfileUseCase.execute({ userId, public: true });
            if (!user)
                return res.status(404).json({ success: false, message: 'Not found' });
            res.json({ success: true, data: user });
        }
        catch (err) {
            logger_1.logger.error('UserController.getPublicProfile error:', err);
            res.status(500).json({ success: false, message: 'Internal error' });
        }
    }
    async updateProfile(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            const data = req.body;
            const updated = await this.updateUserProfileUseCase.execute({ userId, data });
            res.json({ success: true, data: updated });
        }
        catch (err) {
            logger_1.logger.error('UserController.updateProfile error:', err);
            res.status(500).json({ success: false, message: 'Internal error' });
        }
    }
    async uploadAvatar(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            const file = req.file;
            const result = await this.updateUserAvatarUseCase.execute({ userId, file });
            res.json({ success: true, data: result });
        }
        catch (err) {
            logger_1.logger.error('UserController.uploadAvatar error:', err);
            res.status(500).json({ success: false, message: 'Internal error' });
        }
    }
    async lockUser(req, res) {
        try {
            const userId = req.params.id;
            const { lock } = req.body;
            const result = await this.lockUserUseCase.execute({ id: userId, lock });
            res.json({ success: true, data: result });
        }
        catch (err) {
            logger_1.logger.error('UserController.lockUser error:', err);
            res.status(500).json({ success: false, message: 'Internal error' });
        }
    }
    async resetPassword(req, res) {
        try {
            await this.resetPasswordUseCase.execute(req);
            res.json({ success: true, message: 'Password reset initiated' });
        }
        catch (err) {
            logger_1.logger.error('UserController.resetPassword error:', err);
            res.status(500).json({ success: false, message: 'Internal error' });
        }
    }
    async changePassword(req, res) {
        try {
            await this.changePasswordUseCase.execute(req);
            res.json({ success: true, message: 'Password changed' });
        }
        catch (err) {
            logger_1.logger.error('UserController.changePassword error:', err);
            res.status(500).json({ success: false, message: 'Internal error' });
        }
    }
}
exports.UserController = UserController;
exports.default = UserController;
