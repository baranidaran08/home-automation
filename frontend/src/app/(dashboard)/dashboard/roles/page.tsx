import type { Metadata } from 'next';
import { RoleManagement } from '@/features/role';
import { RequirePermission } from '@/components/shared/require-permission';
import { MODULES } from '@/constants/permissions';

export const metadata: Metadata = { title: 'Roles' };

/**
 * /dashboard/roles — Roles Management. Wrapped in RequirePermission so direct-URL
 * access is blocked for users without `roles:read`.
 */
export default function RolesPage() {
  return (
    <RequirePermission module={MODULES.ROLES}>
      <RoleManagement />
    </RequirePermission>
  );
}
