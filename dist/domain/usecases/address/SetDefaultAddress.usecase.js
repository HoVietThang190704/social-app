"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetDefaultAddressUseCase = void 0;
class SetDefaultAddressUseCase {
    constructor(addressRepository) {
        this.addressRepository = addressRepository;
    }
    async execute(addressId, userId) {
        const belongsToUser = await this.addressRepository.belongsToUser(addressId, userId);
        if (!belongsToUser) {
            throw new Error('Không tìm thấy địa chỉ hoặc bạn không có quyền truy cập');
        }
        const updated = await this.addressRepository.setDefault(addressId, userId);
        if (!updated) {
            throw new Error('Không thể đặt địa chỉ mặc định');
        }
        return updated;
    }
}
exports.SetDefaultAddressUseCase = SetDefaultAddressUseCase;
