'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BrandLogo } from './brand-logo';
import { SIDEBAR_NAV, isNavGroup, type NavGroup, type NavItem } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { MODULES } from '@/constants/permissions';
import { usePermissions } from '@/hooks/use-permissions';

/** Brand header shown at the top of the sidebar. */
function SidebarBrand() {
  return (
    <div className="px-6 pb-6 pt-7">
      <BrandLogo />
    </div>
  );
}

/** Shared row styling for both real links and the disabled/secondary items. */
const rowBase =
  'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all';

/** A single navigation link (top level or nested inside a group). */
function NavLink({
  item,
  isActive,
  nested = false,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  nested?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  if (!item.enabled) {
    return (
      <div
        aria-disabled
        title="Coming soon"
        className={cn(rowBase, 'cursor-not-allowed text-muted-foreground/50')}
      >
        <Icon className="h-[18px] w-[18px]" aria-hidden />
        <span className="flex-1">{item.label}</span>
        <Badge variant="secondary" className="text-[10px]">
          Soon
        </Badge>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        rowBase,
        isActive
          ? 'bg-accent font-semibold text-accent-foreground'
          : // Near-foreground (not `muted`) so idle labels stay clearly legible —
            // muted sits below the WCAG AA 4.5:1 minimum on the white sidebar.
            'text-foreground/80 hover:bg-secondary hover:text-foreground'
      )}
    >
      {/* Purple active indicator rail (top-level rows only). */}
      {!nested && (
        <span
          aria-hidden
          className={cn(
            'absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-opacity',
            isActive ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
      <Icon
        className={cn(
          'h-[18px] w-[18px] transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
        )}
        aria-hidden
      />
      {item.label}
    </Link>
  );
}

/**
 * A collapsible sidebar section (e.g. Settings). The group itself is not a route
 * — it only toggles. It auto-expands whenever one of its children is the active
 * page, so deep-linking to /dashboard/users opens Settings with Users highlighted.
 */
function NavGroupSection({
  group,
  items,
  onNavigate,
}: {
  group: NavGroup;
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const panelId = useId();
  const hasActiveChild = items.some((child) => pathname === child.href);
  const [open, setOpen] = useState(hasActiveChild);
  const Icon = group.icon;

  // Re-sync with the route on every navigation: expand when we land inside this
  // section, collapse when we navigate away from it. Deliberately keyed on
  // `pathname` so manual toggling still works while staying on the same page
  // (this only re-evaluates when the route actually changes).
  useEffect(() => {
    setOpen(hasActiveChild);
  }, [pathname, hasActiveChild]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          rowBase,
          'w-full text-left',
          hasActiveChild
            ? 'font-semibold text-foreground'
            : 'text-foreground/80 hover:bg-secondary hover:text-foreground'
        )}
      >
        <Icon
          className={cn(
            'h-[18px] w-[18px] transition-colors',
            hasActiveChild ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
          )}
          aria-hidden
        />
        <span className="flex-1">{group.label}</span>
        <ChevronDown
          className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {/* Conditionally rendered (not just visually hidden) so collapsed links are
          never reachable by keyboard or screen readers. */}
      {open && (
        <div
          id={panelId}
          className="ml-[1.6rem] mt-1 space-y-1 border-l border-border pl-2 duration-200 animate-in fade-in slide-in-from-top-1"
        >
          {items.map((child) => (
            <NavLink
              key={child.label}
              item={child}
              isActive={pathname === child.href}
              nested
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** The navigation list — shared by desktop and mobile renderings. */
function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { canAccessModule } = usePermissions();

  const canCreateQuote = canAccessModule(MODULES.QUOTATIONS);

  // Hide any module the current user cannot access. Groups are filtered by their
  // children, and a group with nothing visible left is dropped entirely — so RBAC
  // behaves exactly as before, just nested one level deeper.
  const entries = SIDEBAR_NAV.map((entry) => {
    if (!isNavGroup(entry)) return canAccessModule(entry.module) ? entry : null;
    const children = entry.children.filter((child) => canAccessModule(child.module));
    return children.length > 0 ? { ...entry, children } : null;
  }).filter(Boolean) as typeof SIDEBAR_NAV;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-3">
      <nav className="space-y-1">
        {entries.map((entry) =>
          isNavGroup(entry) ? (
            <NavGroupSection
              key={entry.label}
              group={entry}
              items={entry.children}
              onNavigate={onNavigate}
            />
          ) : (
            <NavLink
              key={entry.label}
              item={entry}
              isActive={pathname === entry.href}
              onNavigate={onNavigate}
            />
          )
        )}
      </nav>

      {/* Primary action, pinned to the base of the rail. */}
      {canCreateQuote && (
        <div className="mt-auto px-0.5 pb-4 pt-6">
          <Button asChild className="h-11 w-full">
            <Link href={ROUTES.dashboard.quotations} onClick={onNavigate}>
              <Plus className="h-4 w-4" />
              Create Quote
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

interface DashboardSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

/**
 * Responsive sidebar: a floating white card on large screens (inset from the
 * canvas with soft shadow + rounded corners), and a slide-in drawer with a
 * backdrop on small screens.
 */
export function DashboardSidebar({ mobileOpen, onClose }: DashboardSidebarProps) {
  return (
    <>
      {/* Desktop: floating rail */}
      <aside className="fixed inset-y-4 left-4 z-30 hidden w-64 flex-col rounded-2xl border border-border/70 bg-card shadow-card lg:flex">
        <SidebarBrand />
        <SidebarNav />
      </aside>

      {/* Mobile: backdrop + drawer */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-card shadow-float transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar"
      >
        <div className="flex items-start justify-between px-6 pb-6 pt-7">
          <BrandLogo />
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <SidebarNav onNavigate={onClose} />
      </aside>
    </>
  );
}
