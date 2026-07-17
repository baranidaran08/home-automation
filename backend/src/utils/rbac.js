'use strict';

const { ALL_PERMISSION_KEYS } = require('../constants/permissions');

/**
 * Flatten a populated Role into its permission keys. A Super Admin gets the
 * full universe of keys (wildcard), so new modules are covered automatically.
 *
 * @param {object} role - a Role document with `permissions` populated.
 * @returns {string[]} permission keys, e.g. ['dashboard:read', 'products:create']
 */
const rolePermissionKeys = (role) => {
  if (!role) return [];
  if (role.isSuperAdmin) return [...ALL_PERMISSION_KEYS];
  return (role.permissions || []).map((p) => (typeof p === 'string' ? p : p?.key)).filter(Boolean);
};

/**
 * Shape a user (with its role populated) for the client: the profile, a compact
 * role summary, and the flat permission-key list the frontend gates UI with.
 * Never leaks the password (already stripped by the model's toJSON, but we build
 * the object explicitly here).
 */
const serializeAuthUser = (user) => {
  const role = user.role && typeof user.role === 'object' ? user.role : null;
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: role ? { _id: role._id, name: role.name, isSuperAdmin: !!role.isSuperAdmin } : user.role, // fallback: unpopulated ObjectId
    permissions: rolePermissionKeys(role),
    // First-login flag: the frontend redirects to /change-password while true.
    mustChangePassword: !!user.mustChangePassword,
    // The user's locked authentication method ('LOCAL' | 'GOOGLE' | null) and
    // whether they have completed activation. Exposed so the UI can reflect the
    // account state; never exposes googleId.
    authMethod: user.authMethod ?? null,
    accountActivated: !!user.accountActivated,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

module.exports = { rolePermissionKeys, serializeAuthUser };
