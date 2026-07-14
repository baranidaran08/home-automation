import { httpService } from './http.service';
import type { Permission } from '@/types/rbac';

/**
 * Permission API calls. Read-only — the catalogue is seeded on the backend and
 * drives the Role form's permission matrix.
 */
export const permissionService = {
  list: () => httpService.get<Permission[]>('/permissions'),
};
