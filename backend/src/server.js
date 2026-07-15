'use strict';

const createApp = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const { connectDatabase, disconnectDatabase } = require('./config/database');
const { configureCloudinary } = require('./config/cloudinary');
const { seedDatabase } = require('./seeders/bootstrap');

/**
 * Process bootstrap: configure integrations, connect to the database, then
 * start listening. Also wires graceful shutdown and last-resort handlers for
 * uncaught exceptions / unhandled rejections.
 */
const start = async () => {
  // Configure third-party SDKs before serving traffic.
  configureCloudinary();

  await connectDatabase();

  // Auto-seed default system data (permissions, roles, Super Admin) once the DB
  // is connected and before we accept requests. Idempotent — safe on every Render
  // deploy/restart. Non-fatal: a seeding hiccup is logged loudly but must not stop
  // the API from coming up (existing data is never the cause of a failure here).
  try {
    await seedDatabase();
  } catch (err) {
    logger.error(`Database seeding failed (continuing startup): ${err.stack || err.message}`);
  }

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info(`Server listening on http://localhost:${env.port} (${env.nodeEnv})`);
    logger.info(`Health check: http://localhost:${env.port}/api/health`);
  });

  const shutdown = async (signal) => {
    logger.warn(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });

    // Force-exit if graceful shutdown hangs.
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000).unref();
  };

  ['SIGINT', 'SIGTERM'].forEach((signal) => process.on(signal, () => shutdown(signal)));
};

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason instanceof Error ? reason.stack : reason}`);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.stack || err.message}`);
  process.exit(1);
});

start().catch((err) => {
  logger.error(`Failed to start server: ${err.stack || err.message}`);
  process.exit(1);
});
