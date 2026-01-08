// Shop removed for social-app (stub)
export interface ShopDTO { id?: string; shopName?: string }
export class ShopMapper { static toDTO(_s:any): ShopDTO { return { id: String(_s?.id ?? ''), shopName: _s?.shopName } } }

