'use client';

import type { ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface PermissionGateProps {
  module: string;
  action: string;
  children: ReactNode;
  /** Optional fallback rendered when the permission is missing (default: nothing). */
  fallback?: ReactNode;
}

/**
 * Renders its children only when the current user holds `module:action`
 * (Super Admin always passes). Used to make Create/Edit/Delete controls vanish
 * when the permission is missing:
 *
 *   <PermissionGate module={MODULES.PRODUCTS} action={ACTIONS.CREATE}>
 *     <Button>Add Product</Button>
 *   </PermissionGate>
 */
export function PermissionGate({ module, action, children, fallback = null }: PermissionGateProps) {
  const { can } = usePermissions();
  return <>{can(module, action) ? children : fallback}</>;
}
