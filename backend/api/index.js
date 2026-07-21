'use strict';

const createApp = require('../src/app');
const logger = require('../src/utils/logger');
const { connectDatabase } = require('../src/config/database');
const { initRedis } = require('../src/config/redis');
const { configureCloudinary } = require('../src/config/cloudinary');
const { seedDatabase } = require('../src/seeders/bootstrap');

/**
 * Vercel serverless entry point.
 *
 * `src/server.js` is NOT used here: it calls `app.listen()`, which starts a TCP
 * listener and never returns an HTTP response — on serverless that just hangs
 * until the platform kills it (FUNCTION_INVOCATION_TIMEOUT / 504). Serverless
 * instead expects a request handler to be exported, which is what this file does.
 *
 * `src/server.js` remains the entry point for local dev and any container host.
 */

// ---- Module scope: runs ONCE per cold start, not per request -----------------
configureCloudinary();
// Open the (optional) Redis cache connection once per cold start. Reused across
// warm invocations; non-fatal when Redis is absent or unreachable.
initRedis();
const app = createApp();

let bootstrapPromise = null;

/**
 * One-time async bootstrap per container: connect Mongo, then ensure the default
 * system data exists. Cached, so warm invocations skip straight through.
 *
 * This is the serverless equivalent of the work `server.js` does before
 * `listen()`. Without it the DB is never connected and every data route hangs.
 */
const bootstrap = () => {
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    await connectDatabase();

    // Idempotent (upserts). Non-fatal: a seeding hiccup must not take the whole
    // API down — the request can still be served.
    try {
      await seedDatabase();
    } catch (err) {
      logger.error(`[bootstrap] Database seeding failed: ${err.stack || err.message}`);
    }
  })().catch((err) => {
    // Reset so the next invocation retries rather than caching a failure.
    bootstrapPromise = null;
    throw err;
  });

  return bootstrapPromise;
};

// ---- Request handler ---------------------------------------------------------
module.exports = async (req, res) => {
  try {
    await bootstrap();
  } catch (err) {
    logger.error(`[bootstrap] Failed: ${err.stack || err.message}`);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, message: 'Service temporarily unavailable' }));
  }

  // Delegate to the Express app (it handles routing, CORS, auth, errors).
  return app(req, res);
};
