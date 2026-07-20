import type { Metadata } from 'next';
import { UserDetail } from '@/features/user';
import { RequirePermission } from '@/components/shared/require-permission';
import { MODULES } from '@/constants/permissions';

export const metadata: Metadata = {
  title: 'User Details',
};

/**
 * User Details page. Guarded by `users:read` (defence-in-depth; the API enforces
 * it too). `params` is async in the Next 15 App Router.
 */
export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <RequirePermission module={MODULES.USERS}>
      <UserDetail id={id} />
    </RequirePermission>
  );
}
