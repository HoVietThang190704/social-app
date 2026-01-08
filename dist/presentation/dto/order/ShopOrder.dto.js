"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopOrderMapper = void 0;
class ShopOrderMapper {
    static toDTO(_o) { return { id: String(_o?.id ?? '') }; }
}
exports.ShopOrderMapper = ShopOrderMapper;
