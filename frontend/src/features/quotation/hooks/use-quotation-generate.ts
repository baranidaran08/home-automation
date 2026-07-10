'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { quotationService } from '@/services/quotation.service';
import { queryKeys } from '@/constants/query-keys';
import type { NormalizedApiError } from '@/lib/axios';
import type { CreateQuotationInput } from '@/types/quotation';

const errorMessage = (err: unknown, fallback: string) => {
  const e = err as NormalizedApiError;
  // Prefer the first field-level validation message (e.g. "A valid email is required").
  return e?.errors?.[0]?.message ?? e?.message ?? fallback;
};

/**
 * Create the quotation then generate its merged PDF in one flow. Returns the
 * final (generated) quotation on success.
 */
export function useQuotationGenerate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateQuotationInput) => {
      const created = await quotationService.create(input);
      return quotationService.generate(created._id);
    },
    onSuccess: () => {
      toast.success('Quotation generated');
      queryClient.invalidateQueries({ queryKey: queryKeys.quotations.all });
    },
    onError: (err) => toast.error(errorMessage(err, 'Failed to generate quotation')),
  });
}
