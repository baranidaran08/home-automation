'use client';

import type { AxiosProgressEvent } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { templateService } from '@/services/template.service';
import { queryKeys } from '@/constants/query-keys';
import type { NormalizedApiError } from '@/lib/axios';

const errorMessage = (err: unknown, fallback: string) =>
  (err as NormalizedApiError)?.message ?? fallback;

type ProgressCb = (e: AxiosProgressEvent) => void;

/**
 * Create/replace/delete template mutations. Invalidate the template list on
 * success and surface toasts. Upload mutations accept a progress callback.
 */
export function useTemplateMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });

  const create = useMutation({
    mutationFn: ({ formData, onProgress }: { formData: FormData; onProgress?: ProgressCb }) =>
      templateService.create(formData, onProgress),
    onSuccess: () => {
      toast.success('Template uploaded');
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Failed to upload template')),
  });

  const update = useMutation({
    mutationFn: ({
      id,
      formData,
      onProgress,
    }: {
      id: string;
      formData: FormData;
      onProgress?: ProgressCb;
    }) => templateService.update(id, formData, onProgress),
    onSuccess: () => {
      toast.success('Template updated');
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Failed to update template')),
  });

  const remove = useMutation({
    mutationFn: (id: string) => templateService.remove(id),
    onSuccess: () => {
      toast.success('Template deleted');
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Failed to delete template')),
  });

  return { create, update, remove };
}
