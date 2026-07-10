import { httpService } from './http.service';
import type { ApiResponse } from '@/types/api';
import type {
  Category,
  CategoryListParams,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/types/category';

const BASE = '/categories';

/**
 * Category API calls. Pure data access — the list endpoint returns the full
 * envelope so callers get `meta` (pagination) alongside `data`.
 */
export const categoryService = {
  list: (params: CategoryListParams = {}): Promise<ApiResponse<Category[]>> =>
    httpService.getWithMeta<Category[]>(BASE, { params }),

  getById: (id: string) => httpService.get<Category>(`${BASE}/${id}`),

  create: (input: CreateCategoryInput) => httpService.post<Category, CreateCategoryInput>(BASE, input),

  update: (id: string, input: UpdateCategoryInput) =>
    httpService.patch<Category, UpdateCategoryInput>(`${BASE}/${id}`, input),

  remove: (id: string) => httpService.delete<{ id: string }>(`${BASE}/${id}`),
};
