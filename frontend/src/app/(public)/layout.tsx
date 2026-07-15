import type { ReactNode } from 'react';
import { BrandLogo } from '@/components/layout/brand-logo';

/**
 * Public layout for password-recovery pages (/forgot-password, /reset-password).
 *
 * Unlike the (auth) layout, this group has NO GuestGuard: these routes must stay
 * reachable even for an already-authenticated session. A reset link from an email
 * has to open the reset page regardless of any existing login — otherwise the
 * session cookie would bounce the user to the dashboard before the reset (and its
 * token validation) can run. Same centered shell as the auth pages, no redirect.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6">
      <div className="mb-8 text-center">
        <BrandLogo href={null} />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
