import type { ReactNode } from 'react';
import { GuestGuard } from '@/features/auth';
import { BrandLogo } from '@/components/layout/brand-logo';

/**
 * Authentication layout. Provides a centered, minimal shell for the auth route
 * group (login). Wrapped in GuestGuard so authenticated admins are redirected
 * to the dashboard instead of seeing these pages.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GuestGuard>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6">
        <div className="mb-8 text-center">
          <BrandLogo href={null} />
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </GuestGuard>
  );
}
