'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/constants/routes';
import { FullPageLoader } from '@/components/shared/full-page-loader';

/**
 * Protects private areas (dashboard). Unauthenticated users are always
 * redirected to the login page. While the session is still resolving, a loader
 * is shown so protected content never flashes.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const mustChangePassword = useAuthStore((s) => s.user?.mustChangePassword ?? false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(ROUTES.auth.login);
    } else if (status === 'authenticated' && mustChangePassword) {
      // First-login lock: no dashboard access until the temporary password is
      // replaced. The backend enforces this too (authorize returns 403).
      router.replace(ROUTES.changePassword);
    }
  }, [status, mustChangePassword, router]);

  if (status !== 'authenticated' || mustChangePassword) {
    return <FullPageLoader />;
  }

  return <>{children}</>;
}
