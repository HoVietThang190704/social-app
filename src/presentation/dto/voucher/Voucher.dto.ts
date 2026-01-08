// Voucher removed for social-app (stub)
export interface VoucherDTO { id?: string; code?: string }
export class VoucherMapper { static toDTO(_v:any): VoucherDTO { return { id: String(_v?.id ?? ''), code: String(_v?.code ?? '') } } }
