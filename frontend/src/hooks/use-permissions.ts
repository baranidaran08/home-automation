'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { permissionKey } from '@/constants/permissions';

/**
 * Reads the current session's permission keys and exposes a `can(module, action)`
 * predicate. A Super Admin passes every check (wildcard). This is the single
 * source of truth for UI gating: the sidebar, `<PermissionGate>`, and
 * `<RequirePermission>` all build on it.
 *
 * Note: the frontend gate is a UX convenience only — the backend independently
 * enforces every permission and returns 403, so hiding a button is never the
 * security boundary.
 */
export function usePermissions() {
  const user = useAuthStore((s) => s.user);

  return useMemo(() => {
    const isSuperAdmin = !!user?.role?.isSuperAdmin;
    const keys = new Set(user?.permissions ?? []);

    const can = (module: string, action: string) =>
      isSuperAdmin || keys.has(permissionKey(module, action));

    /** True if the user has ANY permission for a module (used for sidebar/read gates). */
    const canAccessModule = (module: string) =>
      isSuperAdmin || [...keys].some((k) => k.startsWith(`${module}:`));

    return { can, canAccessModule, isSuperAdmin, permissions: keys };
  }, [user]);
}
