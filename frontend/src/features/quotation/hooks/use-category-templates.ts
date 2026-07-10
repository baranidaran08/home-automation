'use client';

import { useQuery } from '@tanstack/react-query';
import { templateService } from '@/services/template.service';
import { queryKeys } from '@/constants/query-keys';

/**
 * Auto-detects the Word template for every category. Returns a map of
 * categoryId → { templateName, originalFileName } so the preview can show which
 * selected categories have a template (and warn when one is missing). Reuses
 * the existing Templates API — admins never pick templates manually.
 */
export function useCategoryTemplates() {
  const query = useQuery({
    queryKey: queryKeys.templates.list({ all: true }),
    queryFn: () => templateService.list({ limit: 100 }),
    staleTime: 60 * 1000,
  });

  const byCategoryId = new Map<string, { templateName: string; originalFileName: string }>();
  for (const t of query.data?.data ?? []) {
    if (t.category?._id) {
      byCategoryId.set(t.category._id, {
        templateName: t.templateName,
        originalFileName: t.templateFile?.originalFileName ?? '',
      });
    }
  }

  return { byCategoryId, isLoading: query.isLoading };
}
