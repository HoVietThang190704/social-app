"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareInfoMapper = void 0;
class ShareInfoMapper {
    static toDTO(entity) {
        return {
            resourceId: entity.resourceId,
            resourceType: entity.resourceType,
            shareUrl: entity.shareUrl,
            qrCodeDataUrl: entity.qrCodeDataUrl,
            meta: entity.meta,
        };
    }
}
exports.ShareInfoMapper = ShareInfoMapper;
