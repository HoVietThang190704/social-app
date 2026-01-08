"use strict";
/**
 * Data Transfer Objects for User endpoints
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
class UserMapper {
    static toResponseDto(user) {
        return {
            id: user.id,
            email: user.email,
            userName: user.userName,
            phone: user.phone,
            avatar: user.avatar,
            address: user.address,
            facebookId: user.facebookId || user.facebookID,
            googleId: user.googleId,
            role: user.role,
            isVerified: user.isVerified,
            dateOfBirth: user.dateOfBirth,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            locked: user.locked
        };
    }
}
exports.UserMapper = UserMapper;
