'use strict';

const ApiError = require('../utils/ApiError');
const { MESSAGES } = require('../constants');

/**
 * Catch-all for unmatched routes. Forwards a 404 ApiError to the global
 * error handler. Registered after all real routes, before errorHandler.
 */
const notFound = (req, _res, next) => {
  next(ApiError.notFound(`${MESSAGES.ROUTE_NOT_FOUND}: ${req.method} ${req.originalUrl}`));
};

module.exports = notFound;
