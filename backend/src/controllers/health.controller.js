'use strict';

const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { MESSAGES } = require('../constants');
const env = require('../config/env');

const MONGO_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

/**
 * GET /api/v1/health
 * Lightweight liveness/readiness probe reporting process uptime and the
 * current MongoDB connection state.
 */
const getHealth = asyncHandler(async (_req, res) => {
  const data = {
    status: 'ok',
    environment: env.nodeEnv,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      database: MONGO_STATES[mongoose.connection.readyState] || 'unknown',
    },
  };

  return ApiResponse.ok(res, data, MESSAGES.HEALTH_OK);
});

module.exports = { getHealth };
