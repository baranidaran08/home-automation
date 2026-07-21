import type { Metadata } from 'next';
import { StatsCards, QuickActions, RecentQuotations } from '@/features/dashboard';
import { Rise } from '@/components/shared/rise';

export const metadata: Metadata = {
  title: 'Dashboard',
};

/**
 * Admin dashboard home. Composes the overview stat cards, recent quotations and
 * quick actions. Data fetching lives inside the feature components/hooks.
 *
 * Below the stats the page splits 2:1 — recent quotations is the content you
 * came to read, quick actions is a rail beside it. Both children permission-gate
 * themselves and can render nothing, which the grid absorbs: a lone survivor
 * simply takes its own column rather than leaving a hole.
 */
export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <Rise index={0}>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your home automation system.
        </p>
      </Rise>

      {/* Stat cards stagger themselves at indexes 1-4. */}
      <StatsCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Rise index={3} className="lg:col-span-2">
          <RecentQuotations />
        </Rise>
        <Rise index={4} className="lg:col-span-1">
          <QuickActions />
        </Rise>
      </div>
    </div>
  );
}
