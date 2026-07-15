'use strict';

const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

// Fail loudly on bad queries instead of silently ignoring unknown fields.
mongoose.set('strictQuery', true);

/**
 * Cached connection promise.
 *
 * On a long-running server (local / container hosts) this is simply called once
 * at boot. On serverless (Vercel) the module scope is reused across warm
 * invocations, so caching is essential: without it every request would open a new
 * pool and exhaust the Atlas connection limit. Idempotent either way — callers
 * can safely `await connectDatabase()` on every request.
 */
let connectionPromise = null;

/**
 * Establish (or reuse) the MongoDB connection.
 * Throws on failure so the caller can decide whether to exit / surface an error.
 */
const connectDatabase = async () => {
  // readyState 1 = connected; reuse the live connection.
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(env.mongoUri, {
        // Fail fast rather than hang until the platform kills the function.
        // (A hanging connect is what produces Vercel's FUNCTION_INVOCATION_TIMEOUT.)
        serverSelectionTimeoutMS: 8000,
        maxPoolSize: 10,
      })
      .then((conn) => {
        logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
        return conn.connection;
      })
      .catch((err) => {
        // Clear the cache so the next invocation can retry instead of being
        // stuck with a permanently rejected promise.
        connectionPromise = null;
        throw err;
      });
  }

  return connectionPromise;
};

/** Gracefully close the connection (used on shutdown signals). */
const disconnectDatabase = async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
};

// Surface connection lifecycle events for observability.
mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

module.exports = { connectDatabase, disconnectDatabase };
