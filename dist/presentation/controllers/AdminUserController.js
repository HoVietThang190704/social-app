"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUserController = void 0;
const User_dto_1 = require("../dto/user/User.dto");
const logger_1 = require("../../shared/utils/logger");
class AdminUserController {
    constructor(getUsersUseCase, updateUserProfileUseCase) {
        this.getUsersUseCase = getUsersUseCase;
        this.updateUserProfileUseCase = updateUserProfileUseCase;
    }
    async listUsers(req, res) {
        try {
            const page = Number(req.query.page || 1);
            const limit = Number(req.query.limit || 10);
            const roles = req.query.role && Array.isArray(req.query.role)
                ? req.query.role
                : req.query.roles;
            // support role (single) and role[]
            const roleSingle = typeof req.query.role === 'string' ? req.query.role : undefined;
            const isVerified = req.query.isVerified !== undefined ? req.query.isVerified === 'true' : undefined;
            const search = typeof req.query.search === 'string' ? req.query.search : undefined;
            const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : undefined;
            const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
            const createdFrom = req.query.createdFrom;
            const createdTo = req.query.createdTo;
            const result = await this.getUsersUseCase.execute({
                page,
                limit,
                roles: roles || undefined,
                role: roleSingle,
                isVerified,
                search,
                sortBy,
                sortOrder: sortOrder,
                createdFrom,
                createdTo
            });
            const data = result.users.map(u => User_dto_1.UserMapper.toResponseDto(u));
            res.json({
                success: true,
                message: 'Lấy danh sách người dùng thành công',
                data: {
                    users: data,
                    pagination: {
                        page: result.page,
                        limit: result.limit,
                        total: result.total,
                        totalPages: Math.ceil((result.total || 0) / result.limit)
                    }
                }
            });
        }
        catch (error) {
            logger_1.logger.error('AdminUserController.listUsers error:', error);
            res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách người dùng' });
        }
    }
    /**
     * PUT /api/users/:id
     */
    async updateUser(req, res) {
        try {
            const userId = req.params.id;
            const { userName, phone, dateOfBirth, date_of_birth, avatar, address, role, isVerified } = req.body;
            const normalizedDateOfBirth = dateOfBirth || date_of_birth;
            const updatedUser = await this.updateUserProfileUseCase.execute({
                userId,
                userName,
                phone,
                dateOfBirth: normalizedDateOfBirth ? new Date(normalizedDateOfBirth) : undefined,
                avatar,
                address,
                role,
            });
            const userDto = User_dto_1.UserMapper.toResponseDto(updatedUser);
            res.json({
                success: true,
                message: 'Cập nhật user thành công',
                data: userDto
            });
        }
        catch (error) {
            logger_1.logger.error('AdminUserController.updateUser error:', error);
            if (error.message === 'User not found') {
                res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
                return;
            }
            if (error.message.includes('Phone number already in use') ||
                error.message.includes('Invalid phone number') ||
                error.message.includes('User name') ||
                error.message.includes('age') ||
                error.message.includes('date of birth')) {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật user' });
        }
    }
}
exports.AdminUserController = AdminUserController;
