"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterShopOwnerRequestMapper = void 0;
class RegisterShopOwnerRequestMapper {
    static toDTO(entity) {
        return {
            id: entity.id,
            userId: entity.userId,
            certificateUrl: entity.certificateUrl,
            status: entity.status,
            reviewMessage: entity.reviewMessage ?? null,
            reviewedBy: entity.reviewedBy ?? null,
            reviewedAt: entity.reviewedAt ? entity.reviewedAt.toISOString() : null,
            createdAt: entity.createdAt.toISOString(),
            updatedAt: entity.updatedAt.toISOString(),
            userSnapshot: entity.userSnapshot ?? null
        };
    }
}
exports.RegisterShopOwnerRequestMapper = RegisterShopOwnerRequestMapper;
