'use client';

import { FolderTree, Package, FileText, Boxes } from 'lucide-react';
import { StatCard } from './stat-card';
import { useDashboardSummary } from '../hooks/use-dashboard-summary';
import type { DashboardSummary } from '@/types/dashboard';

const EMPTY_SUMMARY: DashboardSummary = {
  totalCategories: 0,
  totalProducts: 0,
  totalTemplates: 0,
  totalStock: 0,
};

/**
 * The four overview metrics. Owns the data fetch (via the hook) and maps it to
 * reusable StatCard components. Falls back to zeros on error so the grid always
 * renders.
 */
export function StatsCards() {
  const { data, isLoading, isError } = useDashboardSummary();
  const summary = data ?? EMPTY_SUMMARY;

  const cards = [
    {
      title: 'Total Categories',
      value: summary.totalCategories,
      icon: FolderTree,
      accentClassName: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Total Products',
      value: summary.totalProducts,
      icon: Package,
      accentClassName: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Total Templates',
      value: summary.totalTemplates,
      icon: FileText,
      accentClassName: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    },
    {
      title: 'Total Stock',
      value: summary.totalStock,
      icon: Boxes,
      accentClassName: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} isLoading={isLoading} />
        ))}
      </div>
      {isError && (
        <p className="text-sm text-destructive">
          Couldn&apos;t load live stats — showing zeros. Check that the API is running.
        </p>
      )}
    </div>
  );
}
