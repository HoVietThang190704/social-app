// ProductReview removed for social-app (stub)
export interface ProductReviewDTO { id?: string; content?: string }
export class ProductReviewMapper { static toDTO(_e:any): ProductReviewDTO { return { id: String(_e?.id ?? ''), content: _e?.content } } static toDTOs(_arr:any[]): ProductReviewDTO[] { return [] } }

