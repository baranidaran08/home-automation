/**
 * RBAC domain types shared by the Roles, Users, and permission-gating features.
 * A permission key is `"<module>:<action>"`, e.g. `products:create`.
 */
export type PermissionKey = string;

export interface Permission {
  _id: string;
  key: PermissionKey;
  module: string;
  action: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** A role with its populated permissions (as returned by the Roles API). */
export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSuperAdmin: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Compact role summary embedded on a user record. */
export interface RoleSummary {
  _id: string;
  name: string;
  isSuperAdmin: boolean;
  isSystem?: boolean;
}

/** A managed user account (Users module). */
export interface User {
  _id: string;
  name: string;
  email: string;
  role: RoleSummary;
  /** The protected seeded Root Super Admin (cannot be deleted; role locked). */
  isRoot?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissions: string[]; // permission ids
}
export type UpdateRoleInput = Partial<CreateRoleInput>;

export interface CreateUserInput {
  name: string;
  email: string;
  // No password: the backend generates a secure temporary one and emails it.
  role: string; // role id
}
export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

export interface RoleListParams {
  page?: number;
  limit?: number;
  search?: string;
}
export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}
