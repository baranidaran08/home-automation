'use client';

import Link from 'next/link';
import { ChevronRight, FolderPlus, PackagePlus, FileUp, FilePlus2, type LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <CardHeader>
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="group flex items-center gap-3 rounded-xl border border-transparent bg-muted/50 px-3 py-3 transition-colors hover:border-primary/30 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="flex-1 text-sm font-medium">{label}</span>
            <ChevronRight
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
