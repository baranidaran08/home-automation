import type { Metadata } from 'next';
import { LoginExperience } from '@/features/auth/components/login-experience';

export const metadata: Metadata = {
  title: 'Sign in',
};

/**
 * XEN Automation login. Wrapped by the (auth) layout's GuestGuard, so
 * authenticated users are redirected away and never land here. The welcome →
 * login experience (and all reused auth logic) lives in <LoginExperience/>.
 */
export default function LoginPage() {
  return <LoginExperience />;
}
