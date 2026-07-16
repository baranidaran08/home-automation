import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Loader2 } from 'lucide-react';
import { ResetPasswordTokenReader } from '@/features/auth';
import { XenAuthPanel } from '@/features/auth/components/xen-auth-panel';

export const metadata: Metadata = {
  title: 'Reset password',
};

/**
 * Reset-password page. Public (no GuestGuard) so it ALWAYS opens from an email
 * link — even when the user already has a live session — instead of being
 * redirected to the dashboard. The token is read from the `?token=` query param
 * inside a Suspense boundary (required by `useSearchParams`) and passed to the
 * reset form, which then lets the backend validate/expire it.
 */
export default function ResetPasswordPage() {
  return (
    <XenAuthPanel
      title="Set a new password"
      description="Choose a strong password you haven't used before."
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-6 text-[hsl(var(--xen-muted))]">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        }
      >
        <ResetPasswordTokenReader />
      </Suspense>
    </XenAuthPanel>
  );
}
