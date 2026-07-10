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

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(ROUTES.dashboard.root);
    }
  }, [status, router]);

  if (status === 'loading' || status === 'authenticated') {
    return <FullPageLoader />;
  }

  return <>{children}</>;
}
