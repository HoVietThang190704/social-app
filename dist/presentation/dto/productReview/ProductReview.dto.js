"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductReviewMapper = void 0;
class ProductReviewMapper {
    static toDTO(_e) { return { id: String(_e?.id ?? ''), content: _e?.content }; }
    static toDTOs(_arr) { return []; }
}
exports.ProductReviewMapper = ProductReviewMapper;
