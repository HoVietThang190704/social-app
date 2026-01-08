"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LockUserUseCase = void 0;
class LockUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(id, isLocked) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error("User not found");
        }
        // locked = true → tài khoản bị khóa
        const updatedUser = await this.userRepository.update(id, {
            locked: isLocked
        });
        if (!updatedUser) {
            throw new Error("Failed to update user status");
        }
        return updatedUser;
    }
}
exports.LockUserUseCase = LockUserUseCase;
