'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const logger = require('./utils/logger');
const { APP_NAME } = require('./constants');
const apiRoutes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

/**
 * Build and configure the Express application. Kept free of any
 * `listen()`/DB side effects so it can be imported by tests and by the
 * server bootstrap alike.
 */
const createApp = () => {
  const app = express();

  // Trust the first proxy (needed for correct IPs behind load balancers).
  app.set('trust proxy', 1);

  // --- Security & performance middleware ---
  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    })
  );
  app.use(compression());

  // --- Body / cookie parsers ---
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // --- HTTP request logging ---
  app.use(morgan(env.isProduction ? 'combined' : 'dev', { stream: logger.stream }));

  // --- API routes (mounted under /api) ---
  app.use('/api', apiRoutes);

  // Root ping so hitting the bare host returns something friendly.
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: `${APP_NAME} API`,
      docs: '/api/health',
    });
  });

  // --- 404 + centralized error handling (must be last) ---
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
