"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserAddressesUseCase = void 0;
class GetUserAddressesUseCase {
    constructor(addressRepository) {
        this.addressRepository = addressRepository;
    }
    async execute(userId) {
        return await this.addressRepository.findByUserId(userId);
    }
}
exports.GetUserAddressesUseCase = GetUserAddressesUseCase;
