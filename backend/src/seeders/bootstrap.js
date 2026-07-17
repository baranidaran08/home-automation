'use strict';

const logger = require('../utils/logger');
const { seedUser } = require('./user.seeder');
const { backfillAuthMethod } = require('./auth-method.migration');

/**
 * Startup database seeder. Invoked from `server.js` AFTER the Mongo connection is
 * established and BEFORE the HTTP server accepts requests.
 *
 * Unlike the CLI runner in `./index.js`, this function does NOT open/close the
 * connection and does NOT call `process.exit` — the process is already connected
 * and must keep running to serve traffic. It only ensures the default system data
 * exists.
 *
 * Every underlying seeder is idempotent:
 *   - permissions are upserted by their unique `key`,
 *   - system roles are upserted by their unique `name`,
 *   - the Super Admin is matched by email (created once, then left in place).
 *
 * So this is safe to run on every restart / Render deploy: existing records are
 * skipped and only missing ones are inserted — duplicates are impossible.
 *
 * Seeds in dependency order via the cascading user seeder
 * (permissions -> roles -> Super Admin user).
 */
const seedDatabase = async () => {
  logger.info('[seed] Running database seeder...');
  // `seedUser` cascades: it seeds permissions, then roles, then the Super Admin.
  await seedUser();
  // Lock pre-existing (already-activated) accounts to LOCAL so the new Google
  // flow can't hijack them. Runs after the Root is seeded so it is covered too.
  await backfillAuthMethod();
  logger.info('[seed] ✓ Database seeding completed.');
};

module.exports = { seedDatabase };
