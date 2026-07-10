'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';
import { queryKeys } from '@/constants/query-keys';
import type { CategoryListParams } from '@/types/category';

/**
 * Fetches the paginated/filtered category list. `keepPreviousData` avoids a
 * loading flash when paging or searching, for a smoother table experience.
 */
export function useCategories(params: CategoryListParams) {
  return useQuery({
    queryKey: queryKeys.categories.list(params),
    queryFn: () => categoryService.list(params),
    placeholderData: keepPreviousData,
  });
}
