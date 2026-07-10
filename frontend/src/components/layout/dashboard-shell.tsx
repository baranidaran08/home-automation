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
    <div className="min-h-screen bg-muted/30">
      <DashboardSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="lg:pl-64">
        <DashboardTopbar onMenuClick={() => setMobileOpen(true)} />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
