'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { templateService } from '@/services/template.service';
import { queryKeys } from '@/constants/query-keys';
import type { TemplateListParams } from '@/types/template';

/** Paginated/filtered template list. Keeps previous data during paging/search. */
export function useTemplates(params: TemplateListParams) {
  return useQuery({
    queryKey: queryKeys.templates.list(params),
    queryFn: () => templateService.list(params),
    placeholderData: keepPreviousData,
  });
}
