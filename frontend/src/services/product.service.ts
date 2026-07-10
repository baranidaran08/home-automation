import { httpService } from './http.service';
import type { ApiResponse } from '@/types/api';
import type { Product, ProductListParams } from '@/types/product';

const BASE = '/products';

/**
 * Product API calls. Create/update send `multipart/form-data` (images + fields)
 * via the FormData helpers; the list endpoint returns the full envelope so
 * callers get pagination `meta`.
 */
export const productService = {
  list: (params: ProductListParams = {}): Promise<ApiResponse<Product[]>> =>
    httpService.getWithMeta<Product[]>(BASE, { params }),

  getById: (id: string) => httpService.get<Product>(`${BASE}/${id}`),

  getBrands: () => httpService.get<string[]>(`${BASE}/brands`),

  create: (formData: FormData) => httpService.postForm<Product>(BASE, formData),

  update: (id: string, formData: FormData) =>
    httpService.patchForm<Product>(`${BASE}/${id}`, formData),

  remove: (id: string) => httpService.delete<{ id: string }>(`${BASE}/${id}`),
};
