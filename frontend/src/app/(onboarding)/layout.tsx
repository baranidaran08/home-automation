import type { ReactNode } from 'react';
import { ChangePasswordGuard } from '@/features/auth';
import { XenAuthStage } from '@/features/auth/components/xen-auth-stage';

/**
 * Onboarding layout (change-password). Authenticated-only, but intentionally does
 * NOT render the dashboard shell — a first-login user must set their password
 * before they get sidebar/topbar access.
 *
 * Shares the XEN stage with /login: this is still an "entering the platform"
 * moment, so it should feel like one.
 */
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <ChangePasswordGuard>
      <XenAuthStage>{children}</XenAuthStage>
    </ChangePasswordGuard>
  );
}
