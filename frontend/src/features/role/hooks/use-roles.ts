'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { roleService } from '@/services/role.service';
import { queryKeys } from '@/constants/query-keys';
import type { RoleListParams } from '@/types/rbac';

/** Fetches the paginated/filtered role list (permissions populated). */
export function useRoles(params: RoleListParams) {
  return useQuery({
    queryKey: queryKeys.roles.list(params),
    queryFn: () => roleService.list(params),
    placeholderData: keepPreviousData,
  });
}
