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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(ROUTES.auth.login);
    }
  }, [status, router]);

  if (status !== 'authenticated') {
    return <FullPageLoader />;
  }

  return <>{children}</>;
}
