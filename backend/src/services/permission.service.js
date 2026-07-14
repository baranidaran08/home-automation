'use strict';

const Permission = require('../models/permission.model');

/**
 * Permission domain logic. Permissions are seeded, not user-managed, so this is
 * read-only. Returns the full catalogue (sorted by module then action) for the
 * Role form's permission matrix — small, fixed set, so no pagination needed.
 */
const getPermissions = async () => {
  return Permission.find().sort({ module: 1, action: 1 }).lean();
};

module.exports = { getPermissions };
