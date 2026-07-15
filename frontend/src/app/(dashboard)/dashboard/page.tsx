import type { Metadata } from 'next';
import { StatsCards, QuickActions, RecentActivity } from '@/features/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard',
};

/**
 * Admin dashboard home. Composes the overview stat cards, quick actions and
 * recent activity. Data fetching lives inside the feature components/hooks.
 */
export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your home automation system.</p>
      </div>

      <StatsCards />
      <QuickActions />
      <RecentActivity />
    </div>
  );
}
