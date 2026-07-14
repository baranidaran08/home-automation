import { httpService } from './http.service';
import type { ApiResponse } from '@/types/api';
import type { User, UserListParams, CreateUserInput, UpdateUserInput } from '@/types/rbac';

const BASE = '/users';

/**
 * User (RBAC account) API calls. Each user comes back with a compact `role`
 * summary populated. The list endpoint returns the full envelope for pagination.
 */
export const userService = {
  list: (params: UserListParams = {}): Promise<ApiResponse<User[]>> =>
    httpService.getWithMeta<User[]>(BASE, { params }),

  getById: (id: string) => httpService.get<User>(`${BASE}/${id}`),

  create: (input: CreateUserInput) => httpService.post<User, CreateUserInput>(BASE, input),

  update: (id: string, input: UpdateUserInput) =>
    httpService.patch<User, UpdateUserInput>(`${BASE}/${id}`, input),

  remove: (id: string) => httpService.delete<{ id: string }>(`${BASE}/${id}`),
};
