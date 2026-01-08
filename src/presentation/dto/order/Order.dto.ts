// Order removed for social-app (stub)
export interface OrderDTO { id?: string; orderNumber?: string }
export class OrderMapper { static toDTO(_o:any): OrderDTO { return { id: String(_o?.id ?? ''), orderNumber: String(_o?.orderNumber ?? '') } } static toArrayDTO(_arr:any[]): OrderDTO[] { return [] } }

