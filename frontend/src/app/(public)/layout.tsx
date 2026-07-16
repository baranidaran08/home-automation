import type { ReactNode } from 'react';
import { XenAuthStage } from '@/features/auth/components/xen-auth-stage';

/**
 * Public layout for password-recovery pages (/forgot-password, /reset-password).
 *
 * Unlike the (auth) layout, this group has NO GuestGuard: these routes must stay
 * reachable even for an already-authenticated session. A reset link from an email
 * has to open the reset page regardless of any existing login — otherwise the
 * session cookie would bounce the user to the dashboard before the reset (and its
 * token validation) can run.
 *
 * Shares the XEN stage with /login so moving between them is seamless.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return <XenAuthStage>{children}</XenAuthStage>;
}
