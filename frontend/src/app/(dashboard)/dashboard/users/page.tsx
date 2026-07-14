import type { Metadata } from 'next';
import { UserManagement } from '@/features/user';
import { RequirePermission } from '@/components/shared/require-permission';
import { MODULES } from '@/constants/permissions';

export const metadata: Metadata = { title: 'Users' };

/**
 * /dashboard/users — Users Management. Wrapped in RequirePermission so direct-URL
 * access is blocked for users without `users:read`.
 */
export default function UsersPage() {
  return (
    <RequirePermission module={MODULES.USERS}>
      <UserManagement />
    </RequirePermission>
  );
}
