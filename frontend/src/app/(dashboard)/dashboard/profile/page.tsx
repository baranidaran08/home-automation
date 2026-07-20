import type { Metadata } from 'next';
import { MyProfile } from '@/features/profile';

export const metadata: Metadata = {
  title: 'My Profile',
};

/**
 * My Profile page. Any authenticated user can view/edit their own account, so
 * this page needs no permission guard beyond the dashboard layout's AuthGuard.
 */
export default function ProfilePage() {
  return <MyProfile />;
}
