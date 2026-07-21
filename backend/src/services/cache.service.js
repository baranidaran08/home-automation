'use strict';

const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Generic JSON cache helpers over Redis.
 *
 * Every operation is best-effort: if Redis is disabled, unreachable or errors,
 * reads return null (treated as a cache miss → the caller hits MongoDB) and
 * writes/deletes are silently skipped. Redis can therefore never break a request.
 *
 * Domain services should not touch Redis directly — they use these helpers (or a
 * module-specific wrapper such as product-cache.service.js) so all serialization
 * and error handling lives in one place.
 */

/** Read and JSON-parse a cached value. Returns null on miss or any failure. */
const get = async (key) => {
  const client = getRedisClient();
  if (!client) return null;
  try {
    const raw = await client.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    logger.warn(`[cache] get failed for "${key}": ${err.message}`);
    return null;
  }
};

/** JSON-serialize and store a value with an optional TTL (seconds). */
const set = async (key, value, ttlSeconds) => {
  const client = getRedisClient();
  if (!client) return;
  try {
    const raw = JSON.stringify(value);
    if (ttlSeconds && ttlSeconds > 0) {
      await client.set(key, raw, 'EX', ttlSeconds);
    } else {
      await client.set(key, raw);
    }
  } catch (err) {
    logger.warn(`[cache] set failed for "${key}": ${err.message}`);
  }
};

/** Delete one or more keys (accepts a spread and/or arrays of keys). */
const del = async (...keys) => {
  const flat = keys.flat().filter(Boolean);
  if (!flat.length) return;
  const client = getRedisClient();
  if (!client) return;
  try {
    await client.del(flat);
  } catch (err) {
    logger.warn(`[cache] del failed: ${err.message}`);
  }
};

/**
 * Delete every key matching a glob pattern using a non-blocking SCAN cursor.
 * SCAN is used instead of KEYS so a large keyspace never blocks the Redis event
 * loop in production.
 */
const delByPattern = async (pattern) => {
  const client = getRedisClient();
  if (!client) return;
  try {
    const stream = client.scanStream({ match: pattern, count: 100 });
    const found = [];
    for await (const keys of stream) {
      if (keys.length) found.push(...keys);
    }
    if (found.length) await client.del(found);
  } catch (err) {
    logger.warn(`[cache] delByPattern failed for "${pattern}": ${err.message}`);
  }
};

module.exports = { get, set, del, delByPattern };
