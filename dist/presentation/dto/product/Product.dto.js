"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductMapper = void 0;
class ProductMapper {
    static toDTO(_product) { return { id: String(_product?.id ?? ''), name: String(_product?.name ?? '') }; }
    static toDTOArray(_products) { return []; }
}
exports.ProductMapper = ProductMapper;
