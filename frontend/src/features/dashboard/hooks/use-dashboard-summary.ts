'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { queryKeys } from '@/constants/query-keys';

/**
 * Fetches the dashboard summary via TanStack Query. Keeps data-fetching and
 * caching concerns out of the presentational components.
 */
export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: dashboardService.getSummary,
  });
}
