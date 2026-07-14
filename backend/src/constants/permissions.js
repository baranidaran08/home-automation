'use strict';

/**
 * The permission catalogue. RBAC is dynamic (roles + their permissions live in
 * MongoDB), but the *universe* of possible permissions is derived from this
 * static matrix so the seeder, validation, and route guards all agree on the
 * exact set of keys — no scattered string literals.
 *
 * A permission key is `"<module>:<action>"` (e.g. `products:create`).
 */
const MODULES = {
  DASHBOARD: 'dashboard',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  TEMPLATES: 'templates',
  QUOTATIONS: 'quotations',
  USERS: 'users',
  ROLES: 'roles',
};

const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
};

const CRUD = [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE];

/**
 * Which actions each module supports. The dashboard is view-only; every other
 * module is full CRUD. Extend a module here and it automatically flows into the
 * permission seeder, the role form matrix, and validation.
 */
const PERMISSION_MATRIX = {
  [MODULES.DASHBOARD]: [ACTIONS.READ],
  [MODULES.CATEGORIES]: CRUD,
  [MODULES.PRODUCTS]: CRUD,
  [MODULES.TEMPLATES]: CRUD,
  [MODULES.QUOTATIONS]: CRUD,
  [MODULES.USERS]: CRUD,
  [MODULES.ROLES]: CRUD,
};

/** Build the canonical key for a (module, action) pair. */
const permissionKey = (module, action) => `${module}:${action}`;

/** Flat list of every valid permission key, derived from the matrix. */
const ALL_PERMISSION_KEYS = Object.entries(PERMISSION_MATRIX).flatMap(([module, actions]) =>
  actions.map((action) => permissionKey(module, action))
);

/**
 * Convenience accessor mirroring the frontend `PERMS` helper:
 *   PERMS.products.create === 'products:create'
 */
const PERMS = Object.fromEntries(
  Object.entries(PERMISSION_MATRIX).map(([module, actions]) => [
    module,
    Object.fromEntries(actions.map((action) => [action, permissionKey(module, action)])),
  ])
);

module.exports = {
  MODULES,
  ACTIONS,
  CRUD,
  PERMISSION_MATRIX,
  ALL_PERMISSION_KEYS,
  PERMS,
  permissionKey,
};
