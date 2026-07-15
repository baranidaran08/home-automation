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
  let inserted = 0;

  for (const [module, actions] of Object.entries(PERMISSION_MATRIX)) {
    for (const action of actions) {
      const key = permissionKey(module, action);
      // `includeResultMetadata` exposes `lastErrorObject.upserted`, which is set
      // only when this call actually INSERTED a new document — letting us report
      // "skipped" vs "inserted" precisely instead of blindly counting upserts.
      // eslint-disable-next-line no-await-in-loop
      const res = await Permission.findOneAndUpdate(
        { key },
        { key, module, action, description: `Can ${action} ${module}` },
        { upsert: true, new: true, setDefaultsOnInsert: true, includeResultMetadata: true }
      );
      if (res.lastErrorObject?.upserted) inserted += 1;
      byKey.set(key, res.value);
    }
  }

  if (inserted === 0) {
    logger.info(`[seed:permissions] ✓ Permissions already exist (${byKey.size}). Skipping...`);
  } else {
    logger.info(
      `[seed:permissions] ✓ ${inserted} missing permission(s) inserted (${byKey.size} total).`
    );
  }
  return byKey;
};

module.exports = { seedPermissions };
