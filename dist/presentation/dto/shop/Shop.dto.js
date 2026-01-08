"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopMapper = void 0;
class ShopMapper {
    static toDTO(_s) { return { id: String(_s?.id ?? ''), shopName: _s?.shopName }; }
}
exports.ShopMapper = ShopMapper;
