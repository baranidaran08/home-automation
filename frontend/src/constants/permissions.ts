/**
 * Frontend mirror of the backend permission catalogue
 * (backend/src/constants/permissions.js). Keep these in sync — the strings are
 * the contract used to gate UI (`can(module, action)`) and must match the keys
 * the API grants.
 */
export const MODULES = {
  DASHBOARD: 'dashboard',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  TEMPLATES: 'templates',
  QUOTATIONS: 'quotations',
  USERS: 'users',
  ROLES: 'roles',
} as const;

export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

export type ModuleName = (typeof MODULES)[keyof typeof MODULES];
export type ActionName = (typeof ACTIONS)[keyof typeof ACTIONS];

/** Build the canonical `<module>:<action>` key. */
export const permissionKey = (module: string, action: string) => `${module}:${action}`;

/**
 * Convenience accessor: PERMS.products.create === 'products:create'.
 * Every module exposes the full CRUD set; dashboard practically only uses read.
 */
export const PERMS = Object.fromEntries(
  Object.values(MODULES).map((module) => [
    module,
    Object.fromEntries(Object.values(ACTIONS).map((action) => [action, permissionKey(module, action)])),
  ])
) as Record<ModuleName, Record<ActionName, string>>;
