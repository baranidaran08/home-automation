'use client';

import { useQuery } from '@tanstack/react-query';
import { quotationService } from '@/services/quotation.service';
import { queryKeys } from '@/constants/query-keys';

/** How many quotations the dashboard panel shows. */
const RECENT_LIMIT = 5;

const RECENT_PARAMS = { limit: RECENT_LIMIT } as const;

/**
 * The most recent quotations, for the dashboard panel.
 *
 * Reuses the standard list endpoint, which already sorts newest-first
 * server-side, so this shares a cache entry with the quotations module instead
 * of introducing a parallel one — generating a quotation invalidates both.
 *
 * `enabled` lets the caller skip the request for users without `quotations:read`:
 * firing a request we know the API will answer with 403 is pure noise.
 */
export function useRecentQuotations({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.quotations.list(RECENT_PARAMS),
    queryFn: () => quotationService.list(RECENT_PARAMS),
    enabled,
  });
}
