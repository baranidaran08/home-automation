'use client';

import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';
import { queryKeys } from '@/constants/query-keys';

/**
 * Loads active categories for the product form's category dropdown. Reuses the
 * existing category service — no category logic is duplicated here.
 */
export function useCategoryOptions() {
  return useQuery({
    queryKey: queryKeys.categories.options,
    queryFn: async () => {
      const res = await categoryService.list({ status: 'active', limit: 100 });
      return res.data.map((c) => ({ value: c._id, label: c.categoryName }));
    },
    staleTime: 5 * 60 * 1000,
  });
}
