'use client';

import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { queryKeys } from '@/constants/query-keys';

/** Distinct brand list for the brand filter dropdown. */
export function useBrands() {
  return useQuery({
    queryKey: queryKeys.products.brands,
    queryFn: productService.getBrands,
    staleTime: 5 * 60 * 1000,
  });
}
