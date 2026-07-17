'use client';

import { useState, type ReactNode } from 'react';
import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardTopbar } from './dashboard-topbar';
import { Breadcrumb } from './breadcrumb';

/**
 * App shell for the authenticated area: responsive sidebar + sticky topbar with
 * the page content offset to the right of the desktop rail. Owns the mobile
 * drawer open/close state shared between the topbar trigger and the sidebar.
 *
 * Every authenticated page shares the canvas texture rendered here, so the
 * dashboard and the module pages sit on the same surface.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    // `isolate` makes this the stacking context the texture layer resolves
    // against: without it the -z-10 layer escapes to the root context and is
    // painted over by this element's own background.
    <div className="relative isolate min-h-screen bg-background">
      {/* Fixed rather than absolute so the fade is measured against the viewport
          and stays consistent regardless of how long the page's content is. */}
      <div aria-hidden className="dashboard-canvas pointer-events-none fixed inset-0 -z-10" />

      <DashboardSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Offset for the floating desktop rail (w-64 + left-4 inset + gutter). */}
      <div className="lg:pl-[18.5rem]">
        <DashboardTopbar onMenuClick={() => setMobileOpen(true)} />
        <main className="px-4 pb-10 pt-2 sm:px-6 lg:pr-8">
          {/* Global breadcrumb — rendered once here, above every page's title.
              Wrapped in the same max-w-7xl container the pages use, so it aligns
              flush with the page heading below it. The spacing lives on the
              breadcrumb itself, so when it hides (single-crumb pages like the
              dashboard root) it leaves no empty gap above the title. */}
          <div className="mx-auto max-w-7xl">
            <Breadcrumb className="mb-4" />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
