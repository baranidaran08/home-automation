'use strict';

const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

// Fail loudly on bad queries instead of silently ignoring unknown fields.
mongoose.set('strictQuery', true);

/**
 * Establish the MongoDB connection. Called once during server bootstrap.
 * Throws on failure so the caller can decide whether to exit the process.
 */
const connectDatabase = async () => {
  const connection = await mongoose.connect(env.mongoUri);
  logger.info(`MongoDB connected: ${connection.connection.host}/${connection.connection.name}`);
  return connection;
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
