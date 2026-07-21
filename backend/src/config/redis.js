'use strict';

const Redis = require('ioredis');
const env = require('./env');
const logger = require('../utils/logger');

/**
 * Reusable Redis client (cache layer only — MongoDB stays the source of truth).
 *
 * Design goals:
 *  - Single shared connection per process. On a long-running server it is opened
 *    once at boot; on serverless (Vercel) the module scope is reused across warm
 *    invocations, so the same client is reused instead of reconnecting per request.
 *  - Fully optional. When REDIS_URL is not set (or REDIS_ENABLED=false) the getter
 *    returns null and every caller transparently falls back to MongoDB.
 *  - Never fatal. A Redis outage must not take the API down: connection errors are
 *    logged (throttled) and swallowed, commands fail fast rather than hang.
 */

let client = null; // shared singleton
let warnedUnavailable = false; // throttle repeated "unavailable" logs

const isRedisEnabled = () => env.redis.enabled;

/** Build a configured ioredis client. Not connected yet (lazyConnect). */
const createClient = () => {
  const redis = new Redis(env.redis.url, {
    // Connect on the first command / explicit connect() rather than eagerly in
    // the constructor, so importing this module never blocks or throws.
    lazyConnect: true,
    // Fail a command after a couple of retries instead of hanging a request when
    // Redis is unreachable — the caller then degrades to a MongoDB read.
    maxRetriesPerRequest: 2,
    connectTimeout: 8000,
    // Never wait more than a second on a slow/hung Redis; a request must not
    // stall on the cache.
    commandTimeout: 1000,
    // Do not buffer commands while disconnected — reject immediately so the
    // caller falls back to MongoDB instead of the request piling up in a queue.
    enableOfflineQueue: false,
    enableReadyCheck: true,
    // Keep retrying with capped backoff so the cache self-heals when Redis comes
    // back, without ever spinning tightly.
    retryStrategy: (times) => Math.min(times * 200, 3000),
  });

  redis.on('ready', () => {
    warnedUnavailable = false;
    logger.info('[redis] connected and ready');
  });

  redis.on('error', (err) => {
    // Only log the first error until the next successful (re)connect, otherwise a
    // down Redis would flood the logs on every reconnect attempt.
    if (!warnedUnavailable) {
      warnedUnavailable = true;
      logger.warn(`[redis] unavailable — serving from MongoDB only: ${err.message}`);
    }
  });

  redis.on('end', () => logger.warn('[redis] connection closed'));

  return redis;
};

/**
 * Get the shared client, or null when caching is disabled. Kicks off the
 * connection lazily on first use; connection errors surface via the 'error'
 * event (and are swallowed there), never from this call.
 */
const getRedisClient = () => {
  if (!isRedisEnabled()) return null;
  if (!client) {
    client = createClient();
    // Fire-and-forget connect; the 'error' handler owns failures.
    client.connect().catch(() => {});
  }
  return client;
};

/**
 * Optional warm-up called at startup. Logs whether caching is on and triggers
 * the initial connection. Non-blocking and non-fatal.
 */
const initRedis = () => {
  if (!isRedisEnabled()) {
    logger.info('[redis] disabled (no REDIS_URL) — product caching is off');
    return null;
  }
  return getRedisClient();
};

/** Gracefully close the connection (used on shutdown signals). */
const disconnectRedis = async () => {
  if (!client) return;
  try {
    await client.quit();
  } catch {
    // Ignore — we are shutting down anyway.
  } finally {
    client = null;
  }
};

module.exports = { getRedisClient, initRedis, disconnectRedis, isRedisEnabled };
