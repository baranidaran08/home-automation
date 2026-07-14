'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { permissionService } from '@/services/permission.service';
import { queryKeys } from '@/constants/query-keys';
import type { Permission } from '@/types/rbac';

export interface PermissionGroup {
  module: string;
  permissions: Permission[];
}

/**
 * Loads the full permission catalogue and groups it by module so the Role form
 * can render a "module rows × action checkboxes" matrix. Cached indefinitely —
 * the catalogue is static (seeded).
 */
export function usePermissionCatalog() {
  const query = useQuery({
    queryKey: queryKeys.permissions.all,
    queryFn: () => permissionService.list(),
    staleTime: Infinity,
  });

  const groups = useMemo<PermissionGroup[]>(() => {
    const byModule = new Map<string, Permission[]>();
    for (const p of query.data ?? []) {
      const list = byModule.get(p.module) ?? [];
      list.push(p);
      byModule.set(p.module, list);
    }
    return [...byModule.entries()].map(([module, permissions]) => ({ module, permissions }));
  }, [query.data]);

  return { ...query, groups };
}
