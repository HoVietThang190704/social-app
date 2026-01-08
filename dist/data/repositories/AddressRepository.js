"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressRepository = void 0;
const Address_entity_1 = require("../../domain/entities/Address.entity");
const Address_1 = require("../../models/Address");
const logger_1 = require("../../shared/utils/logger");
const mongoose_1 = __importDefault(require("mongoose"));
class AddressRepository {
    toDomainEntity(model) {
        return new Address_entity_1.AddressEntity({
            id: String(model._id),
            userId: String(model.userId),
            recipientName: model.recipientName,
            phone: model.phone,
            address: model.address,
            ward: model.ward,
            district: model.district,
            province: model.province,
            isDefault: model.isDefault,
            label: model.label,
            note: model.note,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt
        });
    }
    async findById(id) {
        try {
            const address = await Address_1.Address.findById(id).lean();
            return address ? this.toDomainEntity(address) : null;
        }
        catch (error) {
            logger_1.logger.error('AddressRepository.findById error:', error);
            throw new Error('Lỗi khi tìm địa chỉ');
        }
    }
    async findByUserId(userId) {
        try {
            const addresses = await Address_1.Address.find({ userId: new mongoose_1.default.Types.ObjectId(userId) })
                .sort({ isDefault: -1, createdAt: -1 })
                .lean();
            return addresses.map(a => this.toDomainEntity(a));
        }
        catch (error) {
            logger_1.logger.error('AddressRepository.findByUserId error:', error);
            throw new Error('Lỗi khi lấy danh sách địa chỉ');
        }
    }
    async getDefaultAddress(userId) {
        try {
            const address = await Address_1.Address.findOne({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                isDefault: true
            }).lean();
            return address ? this.toDomainEntity(address) : null;
        }
        catch (error) {
            logger_1.logger.error('AddressRepository.getDefaultAddress error:', error);
            throw new Error('Lỗi khi lấy địa chỉ mặc định');
        }
    }
    async create(address) {
        try {
            const count = await this.countByUserId(address.userId);
            const isFirstAddress = count === 0;
            const newAddress = await Address_1.Address.create({
                ...address,
                userId: new mongoose_1.default.Types.ObjectId(address.userId),
                isDefault: isFirstAddress ? true : address.isDefault
            });
            return this.toDomainEntity(newAddress);
        }
        catch (error) {
            logger_1.logger.error('AddressRepository.create error:', error);
            throw new Error('Lỗi khi tạo địa chỉ');
        }
    }
    async update(id, userId, data) {
        try {
            const updated = await Address_1.Address.findOneAndUpdate({ _id: id, userId: new mongoose_1.default.Types.ObjectId(userId) }, { $set: data }, { new: true, runValidators: true }).lean();
            return updated ? this.toDomainEntity(updated) : null;
        }
        catch (error) {
            logger_1.logger.error('AddressRepository.update error:', error);
            throw new Error('Lỗi khi cập nhật địa chỉ');
        }
    }
    async delete(id, userId) {
        try {
            const address = await Address_1.Address.findOne({
                _id: id,
                userId: new mongoose_1.default.Types.ObjectId(userId)
            });
            if (!address) {
                return false;
            }
            const result = await Address_1.Address.findOneAndDelete({
                _id: id,
                userId: new mongoose_1.default.Types.ObjectId(userId)
            });
            if (result && result.isDefault) {
                const firstAddress = await Address_1.Address.findOne({
                    userId: new mongoose_1.default.Types.ObjectId(userId)
                }).sort({ createdAt: 1 });
                if (firstAddress) {
                    await Address_1.Address.findByIdAndUpdate(firstAddress._id, { isDefault: true });
                }
            }
            return result !== null;
        }
        catch (error) {
            logger_1.logger.error('AddressRepository.delete error:', error);
            throw new Error('Lỗi khi xóa địa chỉ');
        }
    }
    async setDefault(id, userId) {
        try {
            await Address_1.Address.updateMany({ userId: new mongoose_1.default.Types.ObjectId(userId) }, { $set: { isDefault: false } });
            const updated = await Address_1.Address.findOneAndUpdate({ _id: id, userId: new mongoose_1.default.Types.ObjectId(userId) }, { $set: { isDefault: true } }, { new: true }).lean();
            return updated ? this.toDomainEntity(updated) : null;
        }
        catch (error) {
            logger_1.logger.error('AddressRepository.setDefault error:', error);
            throw new Error('Lỗi khi đặt địa chỉ mặc định');
        }
    }
    async countByUserId(userId) {
        try {
            return await Address_1.Address.countDocuments({ userId: new mongoose_1.default.Types.ObjectId(userId) });
        }
        catch (error) {
            logger_1.logger.error('AddressRepository.countByUserId error:', error);
            return 0;
        }
    }
    async belongsToUser(id, userId) {
        try {
            const count = await Address_1.Address.countDocuments({
                _id: id,
                userId: new mongoose_1.default.Types.ObjectId(userId)
            });
            return count > 0;
        }
        catch (error) {
            logger_1.logger.error('AddressRepository.belongsToUser error:', error);
            return false;
        }
    }
}
exports.AddressRepository = AddressRepository;
