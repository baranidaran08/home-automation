'use strict';

const { connectDatabase, disconnectDatabase } = require('../config/database');
const logger = require('../utils/logger');
const { seedPermissions } = require('./permission.seeder');
const { seedRoles } = require('./role.seeder');
const { seedUser } = require('./user.seeder');

/**
 * Seed runner. Connects to MongoDB, executes the requested seeders, then
 * disconnects and exits. Designed for CLI use and CI/deploy pipelines.
 *
 *   npm run seed              # run all seeders (permissions -> roles -> user)
 *   npm run seed:admin        # alias for the user/RBAC seed
 *   node src/seeders/index.js user
 *
 * Note: `seedRoles` internally seeds permissions and `seedUser` internally seeds
 * roles, so each entry is self-contained and safe to run individually.
 */
const SEEDERS = {
  permissions: seedPermissions,
  roles: seedRoles,
  user: seedUser,
  // Backwards-compatible alias for the previous `seed:admin` script.
  admin: seedUser,
};

// Default run seeds the full RBAC chain via the user seeder (which cascades).
const DEFAULT_ORDER = ['user'];

const run = async () => {
  const requested = process.argv[2]; // optional seeder name
  const names = requested ? [requested] : DEFAULT_ORDER;

  await connectDatabase();

  try {
    for (const name of names) {
      const seeder = SEEDERS[name];
      if (!seeder) {
        throw new Error(`Unknown seeder "${name}". Available: ${Object.keys(SEEDERS).join(', ')}`);
      }
      logger.info(`[seed] Running "${name}"...`);
      // eslint-disable-next-line no-await-in-loop
      await seeder();
    }
    logger.info('[seed] Done.');
  } finally {
    await disconnectDatabase();
  }
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error(`[seed] Failed: ${err.stack || err.message}`);
    process.exit(1);
  });
