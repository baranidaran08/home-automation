import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/features/auth';
import { XenAuthPanel } from '@/features/auth/components/xen-auth-panel';

export const metadata: Metadata = {
  title: 'Forgot password',
};

/**
 * Forgot-password page. Public (no GuestGuard) so it opens for any visitor,
 * authenticated or not. Collects the account email and triggers the reset-link
 * email.
 */
export default function ForgotPasswordPage() {
  return (
    <XenAuthPanel
      title="Forgot your password?"
      description="Enter your email and we'll send you a link to reset it."
    >
      <ForgotPasswordForm />
    </XenAuthPanel>
  );
}
