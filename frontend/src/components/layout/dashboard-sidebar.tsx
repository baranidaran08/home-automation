'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SIDEBAR_NAV } from '@/constants/navigation';
import { usePermissions } from '@/hooks/use-permissions';

/** Brand header shown at the top of the sidebar. */
function SidebarBrand() {
  return (
    <div className="flex h-16 items-center gap-2 border-b px-5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Home className="h-4 w-4" aria-hidden />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold">Home Automation</p>
        <p className="text-xs text-muted-foreground">Admin Panel</p>
      </div>
    </div>
  );
}

/** The navigation list — shared by desktop and mobile renderings. */
function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { canAccessModule } = usePermissions();

  // Hide any module the current user cannot access (no permission for it).
  const items = SIDEBAR_NAV.filter((item) => canAccessModule(item.module));

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-3">
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (!item.enabled) {
            return (
              <div
                key={item.label}
                aria-disabled
                title="Coming soon"
                className="flex cursor-not-allowed items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground/60"
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  Soon
                </Badge>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

interface DashboardSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

/**
 * Responsive sidebar: a fixed rail on large screens, and a slide-in drawer with
 * a backdrop on small screens. Collapses on mobile by default.
 */
export function DashboardSidebar({ mobileOpen, onClose }: DashboardSidebarProps) {
  return (
    <>
      {/* Desktop: fixed rail */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card lg:flex">
        <SidebarBrand />
        <SidebarNav />
      </aside>

      {/* Mobile: backdrop + drawer */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar"
      >
        <div className="flex h-16 items-center justify-between border-b px-5">
          <span className="text-sm font-semibold">Menu</span>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <SidebarNav onNavigate={onClose} />
      </aside>
    </>
  );
}
