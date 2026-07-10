import Link from 'next/link';
import { FolderPlus, PackagePlus, FileUp, FilePlus2, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';

interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
}

// Each action navigates to a placeholder ("Coming Soon") page until its module
// is built; only the href target changes when that happens.
const ACTIONS: QuickAction[] = [
  { label: 'Add Category', href: ROUTES.dashboard.categories, icon: FolderPlus },
  { label: 'Add Product', href: ROUTES.dashboard.products, icon: PackagePlus },
  { label: 'Upload Template', href: ROUTES.dashboard.templates, icon: FileUp },
  { label: 'Generate Quotation', href: ROUTES.dashboard.quotations, icon: FilePlus2 },
];

/** Shortcut buttons to the primary create flows. */
export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                asChild
                variant="outline"
                className="h-auto justify-start gap-3 py-3"
              >
                <Link href={action.href}>
                  <Icon className="h-4 w-4" />
                  {action.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
