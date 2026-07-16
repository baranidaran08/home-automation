'use client';

import { FolderTree, Package, FileText, Boxes } from 'lucide-react';
import { StatCard } from './stat-card';
import { useDashboardSummary } from '../hooks/use-dashboard-summary';
import { usePermissions } from '@/hooks/use-permissions';
import { MODULES, ACTIONS, type ModuleName } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import type { DashboardSummary } from '@/types/dashboard';

const EMPTY_SUMMARY: DashboardSummary = {
  totalCategories: 0,
  totalProducts: 0,
  totalTemplates: 0,
  totalStock: 0,
};

/**
 * The four overview metrics. Owns the data fetch (via the hook) and maps it to
 * reusable StatCards. Falls back to zeros on error so the grid always renders.
 *
 * Each card links to the module it counts, but only when the user can read that
 * module — otherwise it renders as a plain card. Stock has no module of its own;
 * it is a roll-up of product stock, so it points at Products.
 */
export function StatsCards() {
  const { data, isLoading, isError } = useDashboardSummary();
  const { can } = usePermissions();
  const summary = data ?? EMPTY_SUMMARY;

  const linkIfAllowed = (module: ModuleName, href: string) =>
    can(module, ACTIONS.READ) ? href : undefined;

  const cards = [
    {
      title: 'Total Categories',
      value: summary.totalCategories,
      icon: FolderTree,
      href: linkIfAllowed(MODULES.CATEGORIES, ROUTES.dashboard.categories),
    },
    {
      title: 'Total Products',
      value: summary.totalProducts,
      icon: Package,
      href: linkIfAllowed(MODULES.PRODUCTS, ROUTES.dashboard.products),
    },
    {
      title: 'Total Templates',
      value: summary.totalTemplates,
      icon: FileText,
      href: linkIfAllowed(MODULES.TEMPLATES, ROUTES.dashboard.templates),
    },
    {
      title: 'Total Stock',
      value: summary.totalStock,
      icon: Boxes,
      href: linkIfAllowed(MODULES.PRODUCTS, ROUTES.dashboard.products),
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
