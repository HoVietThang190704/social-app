"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserProfileUseCase = void 0;
class GetUserProfileUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(userId) {
        // Validate input
        if (!userId) {
            throw new Error('User ID is required');
        }
        // Get user from repository
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}
exports.GetUserProfileUseCase = GetUserProfileUseCase;
