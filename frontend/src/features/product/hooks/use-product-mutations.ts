'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productService } from '@/services/product.service';
import { queryKeys } from '@/constants/query-keys';
import type { NormalizedApiError } from '@/lib/axios';

const errorMessage = (err: unknown, fallback: string) =>
  (err as NormalizedApiError)?.message ?? fallback;

/**
 * Create/update/delete product mutations. Invalidate the product list and the
 * brands list (a new brand may appear) on success, plus success/error toasts.
 */
export function useProductMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
  };

  const create = useMutation({
    mutationFn: (formData: FormData) => productService.create(formData),
    onSuccess: () => {
      toast.success('Product created');
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Failed to create product')),
  });

  const update = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      productService.update(id, formData),
    onSuccess: () => {
      toast.success('Product updated');
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Failed to update product')),
  });

  const remove = useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: () => {
      toast.success('Product deleted');
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Failed to delete product')),
  });

  return { create, update, remove };
}
