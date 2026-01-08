"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoucherMapper = void 0;
class VoucherMapper {
    static toDTO(_v) { return { id: String(_v?.id ?? ''), code: String(_v?.code ?? '') }; }
}
exports.VoucherMapper = VoucherMapper;
