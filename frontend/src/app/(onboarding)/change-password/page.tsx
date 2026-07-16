import type { Metadata } from 'next';
import { ChangePasswordForm } from '@/features/auth';
import { XenAuthPanel } from '@/features/auth/components/xen-auth-panel';

export const metadata: Metadata = {
  title: 'Change password',
};

/**
 * Forced first-login password change. Reached automatically after a new user logs
 * in with their temporary password (guards redirect here while `mustChangePassword`
 * is true). Wrapped by the (onboarding) layout's ChangePasswordGuard.
 */
export default function ChangePasswordPage() {
  return (
    <XenAuthPanel
      title="Set your password"
      description="For your security, please replace the temporary password you received by email."
    >
      <ChangePasswordForm />
    </XenAuthPanel>
  );
}
