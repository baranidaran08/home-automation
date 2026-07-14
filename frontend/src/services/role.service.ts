import { httpService } from './http.service';
import type { ApiResponse } from '@/types/api';
import type { Role, RoleListParams, CreateRoleInput, UpdateRoleInput } from '@/types/rbac';

const BASE = '/roles';

/**
 * Role API calls. The list endpoint returns the full envelope so callers get
 * `meta` (pagination) alongside `data`. Each role's `permissions` come back
 * populated.
 */
export const roleService = {
  list: (params: RoleListParams = {}): Promise<ApiResponse<Role[]>> =>
    httpService.getWithMeta<Role[]>(BASE, { params }),

  getById: (id: string) => httpService.get<Role>(`${BASE}/${id}`),

  create: (input: CreateRoleInput) => httpService.post<Role, CreateRoleInput>(BASE, input),

  update: (id: string, input: UpdateRoleInput) =>
    httpService.patch<Role, UpdateRoleInput>(`${BASE}/${id}`, input),

  remove: (id: string) => httpService.delete<{ id: string }>(`${BASE}/${id}`),
};
