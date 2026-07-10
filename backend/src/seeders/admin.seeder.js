'use strict';

const Admin = require('../models/admin.model');
const env = require('../config/env');
const logger = require('../utils/logger');
const { ROLES } = require('../constants/roles');

/**
 * Seed the single default admin from environment-provided credentials.
 *
 * Idempotent: if an admin with the configured email already exists, nothing is
 * changed (the password is NOT reset). Safe to run repeatedly and on every
 * deploy. Credentials come from ADMIN_* env vars — never hardcoded.
 *
 * The password is hashed by the model's pre-save hook, so it is created via
 * `new Admin(...).save()` (not `insertMany`, which would bypass the hook).
 */
const seedAdmin = async () => {
  const { name, email, password } = env.admin;

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    logger.info(`[seed:admin] Admin already exists (${existing.email}) — skipping.`);
    return existing;
  }

  const admin = new Admin({
    name,
    email: email.toLowerCase(),
    password,
    role: ROLES.ADMIN,
  });
  await admin.save();

  logger.info(`[seed:admin] Default admin created: ${admin.email}`);
  logger.warn('[seed:admin] Change the default admin password after first login.');
  return admin;
};

module.exports = { seedAdmin };
