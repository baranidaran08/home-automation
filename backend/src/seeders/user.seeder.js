'use strict';

const User = require('../models/user.model');
const env = require('../config/env');
const logger = require('../utils/logger');
const { SUPER_ADMIN } = require('../constants/rbac');
const { seedRoles } = require('./role.seeder');

/**
 * Seed the default Super Admin user from environment-provided credentials.
 * Seeds permissions + roles first (idempotent) so the Super Admin role exists
 * to assign.
 *
 * Idempotent: if a user with the configured email already exists, its password
 * is left untouched; we only ensure it is linked to the Super Admin role (a
 * safe self-heal if the role was reseeded). Credentials come from ADMIN_* env
 * vars — never hardcoded. The password is hashed by the model's pre-save hook,
 * so the account is created via `new User(...).save()`.
 */
const seedUser = async () => {
  const rolesByName = await seedRoles();
  const superAdminRole = rolesByName.get(SUPER_ADMIN);
  if (!superAdminRole) {
    throw new Error('[seed:user] Super Admin role missing — role seeding failed.');
  }

  const { name, email, password } = env.admin;
  const existing = await User.findOne({ email: email.toLowerCase() });

  if (existing) {
    let changed = false;
    if (String(existing.role) !== String(superAdminRole._id)) {
      existing.role = superAdminRole._id;
      changed = true;
    }
    // Self-heal older installs: ensure the seeded account is flagged as Root.
    if (!existing.isRoot) {
      existing.isRoot = true;
      changed = true;
    }
    if (changed) {
      await existing.save();
      logger.info(`[seed:user] Reconciled Root Super Admin (${existing.email}).`);
    } else {
      logger.info(`[seed:user] Root Super Admin already exists (${existing.email}) — skipping.`);
    }
    return existing;
  }

  const user = new User({
    name,
    email: email.toLowerCase(),
    password,
    role: superAdminRole._id,
    isRoot: true, // the protected Root Super Admin
  });
  await user.save();

  logger.info(`[seed:user] Root Super Admin user created: ${user.email}`);
  logger.warn('[seed:user] Change the default password after first login.');
  return user;
};

module.exports = { seedUser };
