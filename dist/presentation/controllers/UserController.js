"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const User_dto_1 = require("../dto/user/User.dto");
const logger_1 = require("../../shared/utils/logger");
class UserController {
    constructor(getUserProfileUseCase, updateUserProfileUseCase, resetPasswordUseCase, changePasswordUseCase, updateUserAvatarUseCase, lockUserUseCase, getUsersUseCase) {
        this.getUserProfileUseCase = getUserProfileUseCase;
        this.updateUserProfileUseCase = updateUserProfileUseCase;
        this.resetPasswordUseCase = resetPasswordUseCase;
        this.changePasswordUseCase = changePasswordUseCase;
        this.updateUserAvatarUseCase = updateUserAvatarUseCase;
        this.lockUserUseCase = lockUserUseCase;
        this.getUsersUseCase = getUsersUseCase;
    }
    async getProfile(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            const user = await this.getUserProfileUseCase.execute(userId);
            res.json({ success: true, data: user });
        }
        catch (err) {
            logger_1.logger.error('UserController.getProfile error:', err);
            res.status(500).json({ success: false, message: err?.message || 'Internal error' });
        }
    }
    async getPublicProfile(req, res) {
        try {
            const userId = req.params.userId;
            const user = await this.getUserProfileUseCase.execute(userId);
            if (!user)
                return res.status(404).json({ success: false, message: 'Not found' });
            res.json({ success: true, data: user });
        }
        catch (err) {
            logger_1.logger.error('UserController.getPublicProfile error:', err);
            res.status(500).json({ success: false, message: err?.message || 'Internal error' });
        }
    }
    async updateProfile(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            const data = req.body;
            const updated = await this.updateUserProfileUseCase.execute({
                userId,
                userName: data.userName,
                phone: data.phone,
                avatar: data.avatar,
                role: data.role,
                isVerified: data.isVerified,
                address: data.address,
                dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
            });
            res.json({ success: true, data: updated });
        }
        catch (err) {
            logger_1.logger.error('UserController.updateProfile error:', err);
            res.status(500).json({ success: false, message: err?.message || 'Internal error' });
        }
    }
    async uploadAvatar(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            const file = req.file;
            if (!file)
                return res.status(400).json({ success: false, message: 'File không hợp lệ' });
            const result = await this.updateUserAvatarUseCase.execute(userId, file);
            res.json({ success: true, data: result });
        }
        catch (err) {
            logger_1.logger.error('UserController.uploadAvatar error:', err);
            res.status(500).json({ success: false, message: err?.message || 'Internal error' });
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
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            const { currentPassword, newPassword } = req.body || {};
            await this.changePasswordUseCase.execute(userId, currentPassword, newPassword);
            res.json({ success: true, message: 'Password changed' });
        }
        catch (err) {
            logger_1.logger.error('UserController.changePassword error:', err);
            res.status(500).json({ success: false, message: err?.message || 'Internal error' });
        }
    }
    async searchUsers(req, res) {
        try {
            const query = typeof req.query.q === 'string'
                ? req.query.q
                : (typeof req.query.search === 'string' ? req.query.search : '');
            const page = Math.max(Number(req.query.page || 1), 1);
            const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 50);
            if (!query || query.trim().length < 2) {
                return res.json({
                    success: true,
                    message: 'Vui lòng nhập tối thiểu 2 ký tự để tìm kiếm',
                    data: {
                        users: [],
                        pagination: {
                            page,
                            limit,
                            total: 0,
                            totalPages: 0
                        }
                    }
                });
            }
            const result = await this.getUsersUseCase.execute({
                search: query,
                page,
                limit,
                sortBy: 'userName',
                sortOrder: 'asc'
            });
            const users = result.users.map((u) => User_dto_1.UserMapper.toResponseDto(u));
            res.json({
                success: true,
                message: 'Tìm kiếm người dùng thành công',
                data: {
                    users,
                    pagination: {
                        page: result.page,
                        limit: result.limit,
                        total: result.total,
                        totalPages: Math.ceil((result.total || 0) / result.limit)
                    }
                }
            });
        }
        catch (err) {
            logger_1.logger.error('UserController.searchUsers error:', err);
            res.status(500).json({ success: false, message: 'Lỗi server khi tìm kiếm người dùng' });
        }
    }
}
exports.UserController = UserController;
exports.default = UserController;
