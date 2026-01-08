// Product domain removed for social-app (stubbed)
export interface ProductResponseDTO { id?: string; name?: string }

export class ProductMapper {
  static toDTO(_product: any): ProductResponseDTO { return { id: String(_product?.id ?? ''), name: String(_product?.name ?? '') } }
  static toDTOArray(_products: any[]): ProductResponseDTO[] { return [] }
}

