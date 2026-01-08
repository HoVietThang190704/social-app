"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEntity = void 0;
class UserEntity {
    constructor(email, password, role = 'customer', isVerified = false, id, userName, phone, avatar, cloudinaryPublicId, facebookID, googleId, address, dateOfBirth, createdAt, updatedAt, locked) {
        this.email = email;
        this.password = password;
        this.role = role;
        this.isVerified = isVerified;
        this.id = id;
        this.userName = userName;
        this.phone = phone;
        this.avatar = avatar;
        this.cloudinaryPublicId = cloudinaryPublicId;
        this.facebookID = facebookID;
        this.googleId = googleId;
        this.address = address;
        this.dateOfBirth = dateOfBirth;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.locked = locked;
    }
    isCustomer() {
        return this.role === 'customer';
    }
    isShopOwner() {
        return this.role === 'shop_owner';
    }
    isAdmin() {
        return this.role === 'admin';
    }
    canAccessAdminPanel() {
        return this.isAdmin() && this.isVerified;
    }
    canManageProducts() {
        return (this.isShopOwner() || this.isAdmin()) && this.isVerified;
    }
    isProfileComplete() {
        return !!(this.userName &&
            this.phone &&
            this.dateOfBirth &&
            this.isVerified);
    }
    getDisplayName() {
        return this.userName || this.email.split('@')[0];
    }
    toObject() {
        const { password, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }
}
exports.UserEntity = UserEntity;
