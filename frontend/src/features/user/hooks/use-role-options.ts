'use client';

import { useQuery } from '@tanstack/react-query';
import { roleService } from '@/services/role.service';
import { queryKeys } from '@/constants/query-keys';

export interface RoleOption {
  value: string;
  label: string;
}

/**
 * Lightweight role list for the User form's Role `<Select>`. Fetches up to 100
 * roles (the system is not expected to have more) and maps to {value,label}.
 */
export function useRoleOptions() {
  return useQuery({
    queryKey: queryKeys.roles.options,
    queryFn: async (): Promise<RoleOption[]> => {
      const res = await roleService.list({ limit: 100 });
      return res.data.map((r) => ({ value: r._id, label: r.name }));
    },
    staleTime: 60_000,
  });
}
