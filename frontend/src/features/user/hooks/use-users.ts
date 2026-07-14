'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { queryKeys } from '@/constants/query-keys';
import type { UserListParams } from '@/types/rbac';

/** Fetches the paginated/filtered user list (role summary populated). */
export function useUsers(params: UserListParams) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => userService.list(params),
    placeholderData: keepPreviousData,
  });
}
