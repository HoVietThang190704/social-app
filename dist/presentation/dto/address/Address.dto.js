"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressMapper = void 0;
class AddressMapper {
    /**
     * Map Entity to DTO
     */
    static toDTO(entity) {
        return {
            id: entity.id,
            recipientName: entity.recipientName,
            phone: entity.phone,
            address: entity.address,
            ward: entity.ward,
            district: entity.district,
            province: entity.province,
            fullAddress: entity.getFullAddress(),
            isDefault: entity.isDefault,
            label: entity.label,
            note: entity.note,
            createdAt: entity.createdAt.toISOString(),
            updatedAt: entity.updatedAt.toISOString()
        };
    }
    /**
     * Map array of Entities to array of DTOs
     */
    static toArrayDTO(entities) {
        return entities.map(e => this.toDTO(e));
    }
}
exports.AddressMapper = AddressMapper;
