"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUsersUseCase = void 0;
class GetUsersUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(options = {}) {
        const page = Math.max(options.page ?? 1, 1);
        const limit = Math.min(Math.max(options.limit ?? 10, 1), 100);
        const offset = (page - 1) * limit;
        const users = await this.userRepository.findAll({
            roles: options.roles,
            role: options.role,
            isVerified: options.isVerified,
            searchTerm: options.search,
            limit,
            offset,
            sortBy: options.sortBy,
            sortOrder: options.sortOrder,
            createdFrom: options.createdFrom,
            createdTo: options.createdTo
        });
        const total = await this.userRepository.count({
            roles: options.roles,
            role: options.role,
            isVerified: options.isVerified,
            searchTerm: options.search,
            createdFrom: options.createdFrom,
            createdTo: options.createdTo
        });
        return {
            users,
            total,
            page,
            limit
        };
    }
}
exports.GetUsersUseCase = GetUsersUseCase;
