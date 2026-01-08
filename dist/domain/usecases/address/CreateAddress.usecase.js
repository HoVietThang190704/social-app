"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAddressUseCase = void 0;
const Address_entity_1 = require("../../entities/Address.entity");
class CreateAddressUseCase {
    constructor(addressRepository) {
        this.addressRepository = addressRepository;
    }
    async execute(data) {
        const tempEntity = new Address_entity_1.AddressEntity({
            id: '',
            userId: data.userId,
            recipientName: data.recipientName,
            phone: data.phone,
            address: data.address,
            ward: data.ward,
            district: data.district,
            province: data.province,
            isDefault: data.isDefault || false,
            label: data.label,
            note: data.note,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const validation = await tempEntity.validate();
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }
        return await this.addressRepository.create({
            userId: data.userId,
            recipientName: data.recipientName,
            phone: data.phone,
            address: data.address,
            ward: data.ward,
            district: data.district,
            province: data.province,
            isDefault: data.isDefault || false,
            label: data.label,
            note: data.note
        });
    }
}
exports.CreateAddressUseCase = CreateAddressUseCase;
