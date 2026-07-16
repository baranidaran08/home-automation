import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth';
import { XenAuthPanel } from '@/features/auth/components/xen-auth-panel';

export const metadata: Metadata = {
  title: 'Sign in',
};

/**
 * XEN Automation login. Wrapped by the (auth) layout's GuestGuard + XenAuthStage,
 * so authenticated users are redirected away and never land here.
 */
export default function LoginPage() {
  return (
    <XenAuthPanel>
      <LoginForm />
    </XenAuthPanel>
  );
}
