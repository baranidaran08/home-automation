import type { ReactNode } from 'react';
import { GuestGuard } from '@/features/auth';

/**
 * Login layout. Wrapped in GuestGuard so authenticated users are redirected to
 * the dashboard instead of seeing this page. This group contains ONLY /login,
 * which renders its own full-screen welcome → login experience (built from the
 * app's standard shadcn/theme), so no shared auth stage is applied here.
 *
 * The other out-of-app pages (forgot/reset in (public), first-login
 * change-password in (onboarding)) keep their own XenAuthStage layouts.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <GuestGuard>{children}</GuestGuard>;
}
