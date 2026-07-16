import type { ReactNode } from 'react';
import { GuestGuard } from '@/features/auth';
import { XenAuthStage } from '@/features/auth/components/xen-auth-stage';

/**
 * Login layout. Wrapped in GuestGuard so authenticated users are redirected to
 * the dashboard instead of seeing this page.
 *
 * This group contains ONLY /login; the other out-of-app pages (forgot/reset in
 * (public), first-login change-password in (onboarding)) have their own guards
 * but share the same XenAuthStage, so moving between them is seamless.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GuestGuard>
      <XenAuthStage>{children}</XenAuthStage>
    </GuestGuard>
  );
}
