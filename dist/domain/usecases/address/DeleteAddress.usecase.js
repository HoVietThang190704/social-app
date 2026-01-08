"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteAddressUseCase = void 0;
class DeleteAddressUseCase {
    constructor(addressRepository) {
        this.addressRepository = addressRepository;
    }
    async execute(addressId, userId) {
        const belongsToUser = await this.addressRepository.belongsToUser(addressId, userId);
        if (!belongsToUser) {
            throw new Error('Không tìm thấy địa chỉ hoặc bạn không có quyền truy cập');
        }
        const deleted = await this.addressRepository.delete(addressId, userId);
        if (!deleted) {
            throw new Error('Không thể xóa địa chỉ');
        }
    }
}
exports.DeleteAddressUseCase = DeleteAddressUseCase;
