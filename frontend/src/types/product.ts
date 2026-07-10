import type { CategoryStatus } from './category';

/** Cloudinary image reference stored on a product. */
export interface ProductImage {
  publicId: string;
  secureUrl: string;
}

/** Category as embedded (populated) on a product response. */
export interface ProductCategoryRef {
  _id: string;
  categoryName: string;
  slug: string;
  status: CategoryStatus;
}

export type ProductStatus = CategoryStatus; // 'active' | 'inactive'

/** A product as returned by the API (category is populated). */
export interface Product {
  _id: string;
  productName: string;
  slug: string;
  category: ProductCategoryRef;
  brand: string;
  modelNumber: string;
  description: string;
  specifications: string;
  warranty: string;
  price: number;
  stock: number;
  images: ProductImage[];
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

/** Query params for the paginated list endpoint. */
export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  status?: ProductStatus;
}
