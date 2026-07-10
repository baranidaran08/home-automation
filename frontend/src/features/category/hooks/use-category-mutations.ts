'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { categoryService } from '@/services/category.service';
import { queryKeys } from '@/constants/query-keys';
import type { NormalizedApiError } from '@/lib/axios';
import type { CreateCategoryInput, UpdateCategoryInput } from '@/types/category';

const errorMessage = (err: unknown, fallback: string) =>
  (err as NormalizedApiError)?.message ?? fallback;

/**
 * Create/update/delete mutations. Each invalidates the category list cache on
 * success and surfaces success/error toasts, keeping this concern out of the
 * UI components.
 */
export function useCategoryMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });

  const create = useMutation({
    mutationFn: (input: CreateCategoryInput) => categoryService.create(input),
    onSuccess: () => {
      toast.success('Category created');
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Failed to create category')),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      categoryService.update(id, input),
    onSuccess: () => {
      toast.success('Category updated');
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Failed to update category')),
  });

  const remove = useMutation({
    mutationFn: (id: string) => categoryService.remove(id),
    onSuccess: () => {
      toast.success('Category deleted');
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Failed to delete category')),
  });

  return { create, update, remove };
}
