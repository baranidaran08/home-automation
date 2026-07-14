'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldX } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { usePermissions } from '@/hooks/use-permissions';
import { ACTIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { FullPageLoader } from './full-page-loader';

interface RequirePermissionProps {
  module: string;
  /** Permission action required to view the page. Defaults to `read`. */
  action?: string;
  children: ReactNode;
}

/**
 * Page-level guard that blocks direct-URL access to a module the user cannot
 * reach. Sits inside the dashboard layout (which already enforces auth), so by
 * the time it renders the session is resolved. If the permission is missing it
 * redirects to the dashboard home and shows a brief 403 panel meanwhile.
 *
 * This is defence-in-depth for the UX; the backend still enforces 403 on the
 * API regardless of what the client renders.
 */
export function RequirePermission({ module, action = ACTIONS.READ, children }: RequirePermissionProps) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const { can } = usePermissions();

  const allowed = can(module, action);

  useEffect(() => {
    if (status === 'authenticated' && !allowed) {
      router.replace(ROUTES.dashboard.root);
    }
  }, [status, allowed, router]);

  if (status !== 'authenticated') {
    return <FullPageLoader />;
  }

  if (!allowed) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center text-muted-foreground">
        <ShieldX className="h-10 w-10" aria-hidden />
        <div>
          <p className="text-base font-medium text-foreground">Access denied</p>
          <p className="text-sm">You don’t have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
