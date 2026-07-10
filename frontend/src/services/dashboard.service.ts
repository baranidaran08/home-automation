import { httpService } from './http.service';
import type { DashboardSummary } from '@/types/dashboard';

/** Dashboard API calls. Pure data access — no React, no UI. */
export const dashboardService = {
  getSummary: () => httpService.get<DashboardSummary>('/dashboard/summary'),
};
