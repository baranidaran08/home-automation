'use client';

import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { queryKeys } from '@/constants/query-keys';

/** Fetches a single user (role summary populated) for the User Details page. */
export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userService.getById(id),
    enabled: Boolean(id),
  });
}
