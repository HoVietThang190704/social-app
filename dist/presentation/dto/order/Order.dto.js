"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderMapper = void 0;
class OrderMapper {
    static toDTO(_o) { return { id: String(_o?.id ?? ''), orderNumber: String(_o?.orderNumber ?? '') }; }
    static toArrayDTO(_arr) { return []; }
}
exports.OrderMapper = OrderMapper;
