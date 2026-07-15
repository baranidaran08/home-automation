import type { ReactNode } from 'react';
import { ChangePasswordGuard } from '@/features/auth';
import { BrandLogo } from '@/components/layout/brand-logo';

/**
 * Onboarding layout (change-password). Authenticated-only, but intentionally does
 * NOT render the dashboard shell — a first-login user must set their password
 * before they get sidebar/topbar access. Centered like the auth layout.
 */
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <ChangePasswordGuard>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6">
        <div className="mb-8 text-center">
          <BrandLogo href={null} />
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </ChangePasswordGuard>
  );
}
