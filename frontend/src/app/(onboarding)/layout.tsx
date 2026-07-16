import type { ReactNode } from 'react';
import { ChangePasswordGuard } from '@/features/auth';
import { AuthShell } from '@/components/layout/auth-shell';

/**
 * Onboarding layout (change-password). Authenticated-only, but intentionally does
 * NOT render the dashboard shell — a first-login user must set their password
 * before they get sidebar/topbar access.
 */
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <ChangePasswordGuard>
      <AuthShell>{children}</AuthShell>
    </ChangePasswordGuard>
  );
}
