'use client';

import { useState, type ReactNode } from 'react';
import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardTopbar } from './dashboard-topbar';

/**
 * App shell for the authenticated area: responsive sidebar + sticky topbar with
 * the page content offset to the right of the desktop rail. Owns the mobile
 * drawer open/close state shared between the topbar trigger and the sidebar.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Offset for the floating desktop rail (w-64 + left-4 inset + gutter). */}
      <div className="lg:pl-[18.5rem]">
        <DashboardTopbar onMenuClick={() => setMobileOpen(true)} />
        <main className="px-4 pb-10 pt-2 sm:px-6 lg:pr-8">{children}</main>
      </div>
    </div>
  );
}
