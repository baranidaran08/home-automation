'use strict';

const { HTTP_STATUS } = require('../constants/httpStatus');

/**
 * Operational error carrying an HTTP status code. Thrown anywhere in the
 * request lifecycle and translated into a JSON response by the global
 * error handler. `isOperational` distinguishes expected errors (bad input,
 * not found) from unexpected programmer bugs.
 */
class ApiError extends Error {
  constructor(statusCode, message, { details = null, isOperational = true } = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  // Named constructors for the common cases — keeps controllers terse.
  static badRequest(message = 'Bad request', details) {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, { details });
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(HTTP_STATUS.CONFLICT, message);
  }

  static unprocessable(message = 'Unprocessable entity', details) {
    return new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, message, { details });
  }

  static internal(message = 'Internal server error') {
    return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, { isOperational: false });
  }

  // Operational (message surfaced to the client) — e.g. a dependency like
  // LibreOffice being unavailable.
  static serviceUnavailable(message = 'Service unavailable', details) {
    return new ApiError(HTTP_STATUS.SERVICE_UNAVAILABLE, message, { details });
  }
}

module.exports = ApiError;
