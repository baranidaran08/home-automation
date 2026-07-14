'use strict';

const Role = require('../models/role.model');
const User = require('../models/user.model');
const logger = require('../utils/logger');
const { DEFAULT_ROLES } = require('../constants/rbac');
const { ALL_PERMISSION_KEYS } = require('../constants/permissions');
const { seedPermissions } = require('./permission.seeder');

/**
 * Upsert the seeded system role(s) — only Super Admin — resolving its permission
 * KEYS to Permission ObjectIds. Depends on permissions existing, so it seeds
 * those first (idempotent). Upserts by unique `name`; the permission set is
 * refreshed on every run.
 *
 * Business roles are intentionally NOT seeded — the Super Admin creates them
 * from the Roles module after login.
 *
 * @returns {Promise<Map<string, object>>} role name -> Role document
 */
const seedRoles = async () => {
  const permissionByKey = await seedPermissions();

  const idsFor = (keys) => {
    const list = keys === 'ALL' ? ALL_PERMISSION_KEYS : keys;
    return list
      .map((key) => permissionByKey.get(key))
      .filter(Boolean)
      .map((p) => p._id);
  };

  const seededNames = DEFAULT_ROLES.map((d) => d.name);
  const byName = new Map();

  for (const def of DEFAULT_ROLES) {
    const permissions = idsFor(def.permissions);
    // eslint-disable-next-line no-await-in-loop
    const role = await Role.findOneAndUpdate(
      { name: def.name },
      {
        name: def.name,
        description: def.description,
        permissions,
        isSuperAdmin: def.isSuperAdmin,
        isSystem: def.isSystem,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    byName.set(def.name, role);
  }

  logger.info(`[seed:roles] Upserted ${byName.size} system role(s): ${seededNames.join(', ')}.`);

  // Reconcile earlier installs: previous versions seeded business roles (Sales
  // Executive, Inventory Manager, Template Designer) as protected system roles.
  // They are no longer seeded, so drop them if unused, or demote them to a
  // normal custom role (isSystem:false) if users still reference them — that way
  // no user is orphaned and the Super Admin can manage/delete them from the UI.
  const stale = await Role.find({ isSystem: true, name: { $nin: seededNames } });
  for (const role of stale) {
    // eslint-disable-next-line no-await-in-loop
    const inUse = await User.countDocuments({ role: role._id });
    if (inUse > 0) {
      role.isSystem = false;
      // eslint-disable-next-line no-await-in-loop
      await role.save();
      logger.warn(
        `[seed:roles] Demoted stale system role "${role.name}" to a custom role (${inUse} user(s) assigned).`
      );
    } else {
      // eslint-disable-next-line no-await-in-loop
      await role.deleteOne();
      logger.info(`[seed:roles] Removed stale seeded system role "${role.name}".`);
    }
  }

  return byName;
};

module.exports = { seedRoles };
