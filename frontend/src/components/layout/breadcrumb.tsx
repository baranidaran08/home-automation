'use client';

import { Fragment, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { useBreadcrumbStore } from '@/store/breadcrumb.store';

/**
 * Global breadcrumb.
 *
 * Rendered ONCE in the dashboard layout (never per-page), it derives the trail
 * automatically from the current route, so pages need to do nothing. Two special
 * cases are handled:
 *  - `users` / `roles` live under the sidebar's "Settings" group, so a
 *    non-clickable "Settings" crumb is injected before them (there is no
 *    /settings route);
 *  - dynamic labels: a page can replace the final crumb via `useBreadcrumbLabel`
 *    (e.g. a quotation number) — see the hook at the bottom of this file.
 */

/** Friendly labels for known route segments; unknown segments fall back to Title Case. */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  products: 'Products',
  categories: 'Categories',
  templates: 'Templates',
  quotations: 'Quotations',
  users: 'Users',
  roles: 'Roles',
};

/** Segments that the sidebar nests under the (route-less) "Settings" group. */
const SETTINGS_SEGMENTS = new Set(['users', 'roles']);

// "Settings" has no page of its own, so its crumb links to its first child
// (Users) — clicking a group lands on its default page, keeping every crumb
// clickable.
const SETTINGS_LANDING = ROUTES.dashboard.users;

interface Crumb {
  label: string;
  /** Link target. Omitted for the current page and the "Settings" group label. */
  href?: string;
}

const titleCase = (segment: string) =>
  segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Build the crumb trail for a pathname, applying the current-page override. */
function buildCrumbs(pathname: string, overrideLabel?: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: Crumb[] = [];
  let href = '';

  segments.forEach((segment, i) => {
    href += `/${segment}`;
    const isLast = i === segments.length - 1;

    // Inject the "Settings" group ahead of users/roles, linked to its default
    // page (Settings itself is route-less).
    if (SETTINGS_SEGMENTS.has(segment)) {
      crumbs.push({ label: 'Settings', href: SETTINGS_LANDING });
    }

    const label = isLast && overrideLabel ? overrideLabel : SEGMENT_LABELS[segment] ?? titleCase(segment);
    // The current page is not a link; everything above it is.
    crumbs.push({ label, href: isLast ? undefined : href });
  });

  return crumbs;
}

export function Breadcrumb({ className }: { className?: string }) {
  const pathname = usePathname();
  const override = useBreadcrumbStore((s) => s.override);
  // Only apply an override that was set for THIS exact path.
  const overrideLabel = override?.path === pathname ? override.label : undefined;

  const crumbs = buildCrumbs(pathname, overrideLabel);
  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('min-w-0', className)}>
      <ol className="flex items-center gap-1.5 text-sm">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <Fragment key={`${crumb.label}-${i}`}>
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-foreground/40" aria-hidden />
              )}
              <li className="min-w-0">
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    // `foreground/70` keeps links subordinate to the bold current
                    // page while staying clearly legible in light mode (plain
                    // `muted-foreground` was too faint on the near-white canvas).
                    className="block max-w-[12ch] truncate text-foreground/70 transition-colors hover:text-foreground sm:max-w-[20ch]"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    className="block max-w-[16ch] truncate font-medium text-foreground sm:max-w-[28ch]"
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Override the final breadcrumb label for the current page — for dynamic routes
 * where the segment alone isn't meaningful (a quotation number, a product name).
 * Pass `undefined` while the label is still loading; the auto label shows until
 * then. Clears automatically on unmount / navigation.
 *
 * @example
 *   useBreadcrumbLabel(quotation?.quotationNumber);
 */
export function useBreadcrumbLabel(label: string | undefined) {
  const pathname = usePathname();
  const setOverride = useBreadcrumbStore((s) => s.setOverride);
  const clear = useBreadcrumbStore((s) => s.clear);

  useEffect(() => {
    if (label) setOverride(pathname, label);
    return () => clear();
  }, [pathname, label, setOverride, clear]);
}
