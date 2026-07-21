'use client';

import Link from 'next/link';
import { ChevronRight, FolderPlus, PackagePlus, FileUp, FilePlus2, type LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/hooks/use-permissions';
import { MODULES, ACTIONS as PERMISSION_ACTIONS, type ModuleName } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';

interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Module whose `create` permission this shortcut requires. */
  module: ModuleName;
}

const ACTIONS: QuickAction[] = [
  {
    label: 'Add Category',
    href: ROUTES.dashboard.categories,
    icon: FolderPlus,
    module: MODULES.CATEGORIES,
  },
  {
    label: 'Add Product',
    href: ROUTES.dashboard.products,
    icon: PackagePlus,
    module: MODULES.PRODUCTS,
  },
  {
    label: 'Upload Template',
    href: ROUTES.dashboard.templates,
    icon: FileUp,
    module: MODULES.TEMPLATES,
  },
  {
    label: 'Generate Quotation',
    href: ROUTES.dashboard.quotations,
    icon: FilePlus2,
    module: MODULES.QUOTATIONS,
  },
];

/**
 * Shortcuts to the primary create flows.
 *
 * Each shortcut is filtered by its module's `create` permission, so an Inventory
 * Manager never sees "Generate Quotation". If nothing survives the filter the
 * whole card is dropped rather than left as an empty shell.
 */
export function QuickActions() {
  const { can } = usePermissions();
  const actions = ACTIONS.filter((action) => can(action.module, PERMISSION_ACTIONS.CREATE));

  if (actions.length === 0) return null;

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      {/* Vercel settings-panel style: a bordered list of rows, neutral icons,
          generous vertical padding, subtle hover — no colored tiles. */}
      <div className="border-t border-border">
        {actions.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="group flex items-center gap-3 border-b border-border px-6 py-4 transition-colors last:border-b-0 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <Icon
              className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
              aria-hidden
            />
            <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
            <ChevronRight
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        ))}
      </div>
    </Card>
  );
}
