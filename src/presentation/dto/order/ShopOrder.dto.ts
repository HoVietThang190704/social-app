// ShopOrder removed for social-app (stub)
export interface ShopOrderDTO { id?: string }
export class ShopOrderMapper { static toDTO(_o:any): ShopOrderDTO { return { id: String(_o?.id ?? '') } } }
