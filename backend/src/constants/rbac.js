'use strict';

/**
 * The single seeded system role: Super Admin. The application installs with
 * exactly ONE role so a fresh deployment has an owner who can log in and build
 * the rest. All business roles (e.g. Sales Executive, Inventory Manager) are
 * created by the Super Admin from the Roles module after login — they are NOT
 * seeded.
 *
 * `isSuperAdmin` is a wildcard bypass (all current and future permissions);
 * `isSystem` protects the role from being renamed or deleted through the API.
 */
const SUPER_ADMIN = 'Super Admin';

const DEFAULT_ROLES = [
  {
    name: SUPER_ADMIN,
    description: 'Full, unrestricted access to every module.',
    isSuperAdmin: true,
    isSystem: true,
    // Permissions are irrelevant when isSuperAdmin is true, but we still attach
    // the complete set so the role reads correctly in the UI.
    permissions: 'ALL',
  },
];

module.exports = { DEFAULT_ROLES, SUPER_ADMIN };
