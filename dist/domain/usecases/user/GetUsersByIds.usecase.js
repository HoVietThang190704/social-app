"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUsersByIdsUseCase = void 0;
class GetUsersByIdsUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(ids) {
        if (!ids || ids.length === 0) {
            return [];
        }
        return this.userRepository.findManyByIds(ids);
    }
}
exports.GetUsersByIdsUseCase = GetUsersByIdsUseCase;
