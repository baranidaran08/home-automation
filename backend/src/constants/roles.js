'use strict';

/**
 * Application roles. This system currently has a single ADMIN, but the enum is
 * defined centrally so authorization can be extended without scattering
 * string literals across the codebase.
 */
const ROLES = {
  ADMIN: 'admin',
};

const ROLE_VALUES = Object.values(ROLES);

module.exports = { ROLES, ROLE_VALUES };
