"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const User_entity_1 = require("../../domain/entities/User.entity");
const User_1 = require("../../models/User");
const logger_1 = require("../../shared/utils/logger");
const mongoose_1 = __importDefault(require("mongoose"));
const textSearch_1 = require("../../shared/utils/textSearch");
class UserRepository {
    async create(user) {
        const newUser = new User_1.User({
            email: user.email,
            password: user.password,
            userName: user.userName,
            phone: user.phone,
            avatar: user.avatar,
            cloudinaryPublicId: user.cloudinaryPublicId,
            facebookID: user.facebookID,
            googleId: user.googleId,
            address: user.address,
            role: user.role,
            isVerified: user.isVerified,
            date_of_birth: user.dateOfBirth
        });
        const savedUser = await newUser.save();
        return this.mapToEntity(savedUser);
    }
    async findById(id) {
        // Populate friends so public profile can include friend previews
        const user = await User_1.User.findById(id).populate({ path: 'friends', select: 'userName email avatar createdAt' });
        return user ? this.mapToEntity(user) : null;
    }
    async findByEmail(email) {
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        return user ? this.mapToEntity(user) : null;
    }
    async findByGoogleId(googleId) {
        const user = await User_1.User.findOne({ googleId });
        return user ? this.mapToEntity(user) : null;
    }
    async findByPhone(phone) {
        const user = await User_1.User.findOne({ phone });
        return user ? this.mapToEntity(user) : null;
    }
    async findManyByIds(ids) {
        const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
        if (uniqueIds.length === 0) {
            return [];
        }
        const objectIds = uniqueIds
            .filter((id) => mongoose_1.default.Types.ObjectId.isValid(id))
            .map((id) => new mongoose_1.default.Types.ObjectId(id));
        if (objectIds.length === 0) {
            return [];
        }
        const users = await User_1.User.find({ _id: { $in: objectIds } });
        return users.map(user => this.mapToEntity(user));
    }
    async update(id, data) {
        const updateData = {};
        if (data.userName !== undefined)
            updateData.userName = data.userName;
        if (data.phone !== undefined)
            updateData.phone = data.phone;
        if (data.avatar !== undefined)
            updateData.avatar = data.avatar;
        if (data.cloudinaryPublicId !== undefined)
            updateData.cloudinaryPublicId = data.cloudinaryPublicId;
        if (data.dateOfBirth !== undefined)
            updateData.date_of_birth = data.dateOfBirth;
        if (data.isVerified !== undefined)
            updateData.isVerified = data.isVerified;
        if (data.role !== undefined)
            updateData.role = data.role;
        if (data.address !== undefined)
            updateData.address = data.address;
        if (data.locked !== undefined)
            updateData.locked = data.locked;
        const user = await User_1.User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        return user ? this.mapToEntity(user) : null;
    }
    async delete(id) {
        const result = await User_1.User.findByIdAndDelete(id);
        return !!result;
    }
    async findAll(filters) {
        const query = {};
        // role / roles
        if (filters?.roles && Array.isArray(filters.roles) && filters.roles.length > 0) {
            query.role = { $in: filters.roles };
        }
        else if (filters?.role) {
            query.role = filters.role;
        }
        if (filters?.isVerified !== undefined) {
            query.isVerified = filters.isVerified;
        }
        // search
        if (filters?.searchTerm) {
            const trimmed = filters.searchTerm.trim();
            if (trimmed) {
                const flexibleRegex = (0, textSearch_1.buildVietnameseRegex)(trimmed);
                const fallbackRegex = new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                query.$or = [
                    { userName: flexibleRegex },
                    { email: fallbackRegex },
                    { phone: fallbackRegex }
                ];
            }
        }
        // createdAt range
        if (filters?.createdFrom || filters?.createdTo) {
            query.createdAt = {};
            if (filters.createdFrom)
                query.createdAt.$gte = new Date(filters.createdFrom);
            if (filters.createdTo)
                query.createdAt.$lte = new Date(filters.createdTo);
        }
        let queryBuilder = User_1.User.find(query);
        // sorting
        if (filters?.sortBy) {
            const order = filters.sortOrder === 'asc' ? 1 : -1;
            const sortObj = {};
            sortObj[filters.sortBy] = order;
            queryBuilder = queryBuilder.sort(sortObj);
        }
        else {
            queryBuilder = queryBuilder.sort({ createdAt: -1 });
        }
        if (filters?.limit) {
            queryBuilder = queryBuilder.limit(filters.limit);
        }
        if (filters?.offset) {
            queryBuilder = queryBuilder.skip(filters.offset);
        }
        const users = await queryBuilder.exec();
        return users.map(user => this.mapToEntity(user));
    }
    async count(filters) {
        const query = {};
        if (filters?.roles && Array.isArray(filters.roles) && filters.roles.length > 0) {
            query.role = { $in: filters.roles };
        }
        else if (filters?.role) {
            query.role = filters.role;
        }
        if (filters?.isVerified !== undefined) {
            query.isVerified = filters.isVerified;
        }
        if (filters?.searchTerm) {
            const trimmed = filters.searchTerm.trim();
            if (trimmed) {
                const flexibleRegex = (0, textSearch_1.buildVietnameseRegex)(trimmed);
                const fallbackRegex = new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                query.$or = [
                    { userName: flexibleRegex },
                    { email: fallbackRegex },
                    { phone: fallbackRegex }
                ];
            }
        }
        if (filters?.createdFrom || filters?.createdTo) {
            query.createdAt = {};
            if (filters.createdFrom)
                query.createdAt.$gte = new Date(filters.createdFrom);
            if (filters.createdTo)
                query.createdAt.$lte = new Date(filters.createdTo);
        }
        return User_1.User.countDocuments(query);
    }
    async emailExists(email) {
        const count = await User_1.User.countDocuments({ email: email.toLowerCase() });
        return count > 0;
    }
    async phoneExists(phone) {
        const count = await User_1.User.countDocuments({ phone });
        return count > 0;
    }
    mapToEntity(model) {
        const cloudinaryId = model.cloudinaryPublicId ?? model.cloudinaryPublicIds ?? undefined;
        const facebookID = model.facebookID ?? model.facebookId ?? undefined;
        const addressWithFriends = model.address ?? {};
        if (model.friends && Array.isArray(model.friends)) {
            addressWithFriends.friends = model.friends.map((f) => ({
                id: f._id?.toString(),
                name: f.userName || f.email,
                photo: f.avatar || null,
            }));
        }
        if (model.friendsCount !== undefined) {
            addressWithFriends.friendCount = model.friendsCount;
        }
        return new User_entity_1.UserEntity(model.email, model.password ?? '', model.role, model.isVerified, model._id.toString(), model.userName, model.phone, model.avatar, cloudinaryId, facebookID, model.googleId, 
        // address (with optional friends preview)
        addressWithFriends, 
        // dateOfBirth
        model.date_of_birth, model.createdAt, model.updatedAt, model.locked // Thêm trường locked vào entity
        );
    }
    async updatePassword(id, hashedPassword) {
        try {
            const result = await User_1.User.updateOne({ _id: id }, { $set: { password: hashedPassword } });
            return result.modifiedCount > 0;
        }
        catch (error) {
            logger_1.logger.error('UserRepository.updatePassword error:', error);
            return false;
        }
    }
    async setResetPasswordToken(email, token, expires) {
        try {
            const result = await User_1.User.updateOne({ email }, {
                $set: {
                    resetPasswordToken: token,
                    resetPasswordExpires: expires
                }
            });
            return result.modifiedCount > 0;
        }
        catch (error) {
            logger_1.logger.error('UserRepository.setResetPasswordToken error:', error);
            return false;
        }
    }
    async findByResetPasswordToken(token) {
        try {
            const user = await User_1.User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: new Date() }
            });
            if (!user)
                return null;
            return this.mapToEntity(user);
        }
        catch (error) {
            logger_1.logger.error('UserRepository.findByResetPasswordToken error:', error);
            return null;
        }
    }
    async clearResetPasswordToken(id) {
        try {
            const result = await User_1.User.updateOne({ _id: id }, {
                $unset: {
                    resetPasswordToken: '',
                    resetPasswordExpires: ''
                }
            });
            return result.modifiedCount > 0;
        }
        catch (error) {
            logger_1.logger.error('UserRepository.clearResetPasswordToken error:', error);
            return false;
        }
    }
}
exports.UserRepository = UserRepository;
