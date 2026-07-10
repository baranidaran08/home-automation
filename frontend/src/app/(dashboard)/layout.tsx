import type { ReactNode } from 'react';
import { AuthGuard } from '@/features/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';

/**
 * Dashboard layout. Protected by AuthGuard (unauthenticated users are always
 * redirected to login), then rendered inside the responsive DashboardShell
 * (sidebar + topbar) shared by every authenticated page.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
