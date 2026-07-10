'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { queryKeys } from '@/constants/query-keys';
import type { ProductListParams } from '@/types/product';

/** Paginated/filtered product list. Keeps previous data during paging/search. */
export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productService.list(params),
    placeholderData: keepPreviousData,
  });
}
