'use strict';

const Permission = require('../models/permission.model');
const logger = require('../utils/logger');
const { PERMISSION_MATRIX, permissionKey } = require('../constants/permissions');

/**
 * Seed the permission catalogue from the static PERMISSION_MATRIX. Idempotent:
 * each `(module, action)` is upserted by its unique `key`, so running it
 * repeatedly (every deploy) neither duplicates nor mutates existing rows.
 * Adding a module/action to the matrix and re-seeding introduces the new
 * permissions automatically.
 *
 * @returns {Promise<Map<string, object>>} key -> Permission document
 */
const seedPermissions = async () => {
  const byKey = new Map();

  for (const [module, actions] of Object.entries(PERMISSION_MATRIX)) {
    for (const action of actions) {
      const key = permissionKey(module, action);
      // eslint-disable-next-line no-await-in-loop
      const permission = await Permission.findOneAndUpdate(
        { key },
        { key, module, action, description: `Can ${action} ${module}` },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      byKey.set(key, permission);
    }
  }

  logger.info(`[seed:permissions] Upserted ${byKey.size} permissions.`);
  return byKey;
};

module.exports = { seedPermissions };
