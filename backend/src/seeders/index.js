'use strict';

const { connectDatabase, disconnectDatabase } = require('../config/database');
const logger = require('../utils/logger');
const { seedAdmin } = require('./admin.seeder');

/**
 * Seed runner. Connects to MongoDB, executes the requested seeders, then
 * disconnects and exits. Designed for CLI use and CI/deploy pipelines.
 *
 *   npm run seed          # run all seeders
 *   npm run seed:admin    # run only the admin seeder
 *   node src/seeders/index.js admin
 */
const SEEDERS = {
  admin: seedAdmin,
};

const run = async () => {
  const requested = process.argv[2]; // optional seeder name
  const names = requested ? [requested] : Object.keys(SEEDERS);

  await connectDatabase();

  try {
    for (const name of names) {
      const seeder = SEEDERS[name];
      if (!seeder) {
        throw new Error(`Unknown seeder "${name}". Available: ${Object.keys(SEEDERS).join(', ')}`);
      }
      logger.info(`[seed] Running "${name}"...`);
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
