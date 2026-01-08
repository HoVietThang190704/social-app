"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAddressUseCase = void 0;
class UpdateAddressUseCase {
    constructor(addressRepository) {
        this.addressRepository = addressRepository;
    }
    async execute(addressId, userId, data) {
        const belongsToUser = await this.addressRepository.belongsToUser(addressId, userId);
        if (!belongsToUser) {
            throw new Error('Không tìm thấy địa chỉ hoặc bạn không có quyền truy cập');
        }
        const updated = await this.addressRepository.update(addressId, userId, data);
        if (!updated) {
            throw new Error('Không thể cập nhật địa chỉ');
        }
        return updated;
    }
}
exports.UpdateAddressUseCase = UpdateAddressUseCase;
