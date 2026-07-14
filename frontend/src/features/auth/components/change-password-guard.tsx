'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/constants/routes';
import { FullPageLoader } from '@/components/shared/full-page-loader';

/**
 * Guards the /change-password page. Requires an authenticated session (guests are
 * sent to login) but — unlike AuthGuard — it deliberately does NOT redirect users
 * who still have `mustChangePassword`, since this is the one page they are allowed
 * to reach. A user who has already changed their password can still visit it to
 * change it again voluntarily.
 */
export function ChangePasswordGuard({ children }: { children: ReactNode }) {
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
