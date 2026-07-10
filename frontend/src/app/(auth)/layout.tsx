import type { ReactNode } from 'react';
import { GuestGuard } from '@/features/auth';

/**
 * Authentication layout. Provides a centered, minimal shell for the auth route
 * group (login). Wrapped in GuestGuard so authenticated admins are redirected
 * to the dashboard instead of seeing these pages.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GuestGuard>
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4 sm:p-6">
        <div className="mb-6 max-w-sm text-center">
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
            Home Automation Quotation Management System
          </h1>
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </GuestGuard>
  );
}
