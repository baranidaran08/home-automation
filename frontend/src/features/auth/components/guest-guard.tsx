'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/constants/routes';
import { FullPageLoader } from '@/components/shared/full-page-loader';

/**
 * Guards guest-only pages (login). Authenticated users are redirected to the
 * dashboard and never see the login screen again.
 */
export function GuestGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const mustChangePassword = useAuthStore((s) => s.user?.mustChangePassword ?? false);

  useEffect(() => {
    if (status === 'authenticated') {
      // Send first-login users to change-password; everyone else to the dashboard.
      router.replace(mustChangePassword ? ROUTES.changePassword : ROUTES.dashboard.root);
    }
  }, [status, mustChangePassword, router]);

  if (status === 'loading' || status === 'authenticated') {
    return <FullPageLoader />;
  }

  return <>{children}</>;
}
