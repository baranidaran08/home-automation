import type { ReactNode } from 'react';
import { GuestGuard } from '@/features/auth';
import { AuthShell } from '@/components/layout/auth-shell';

/**
 * Authentication layout (login). Wrapped in GuestGuard so authenticated users are
 * redirected to the dashboard instead of seeing these pages.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GuestGuard>
      <AuthShell>{children}</AuthShell>
    </GuestGuard>
  );
}
