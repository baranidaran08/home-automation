'use strict';

const mongoose = require('mongoose');
const { ZodError } = require('zod');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS, MESSAGES } = require('../constants');
const env = require('../config/env');
const logger = require('../utils/logger');

/**
 * Normalise disparate error types (ApiError, Zod, Mongoose, Multer, JWT)
 * into a single ApiError so the response shape is always consistent.
 */
const normalizeError = (err) => {
  if (err instanceof ApiError) {
    return err;
  }

  // Zod validation errors -> 422 with field-level details.
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    return ApiError.unprocessable(MESSAGES.VALIDATION_FAILED, details);
  }

  // Mongoose schema validation.
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({
      path: e.path,
      message: e.message,
    }));
    return ApiError.unprocessable(MESSAGES.VALIDATION_FAILED, details);
  }

  // Invalid ObjectId / cast failures.
  if (err instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid value for "${err.path}"`);
  }

  // Duplicate key (unique index) violations.
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {}).join(', ');
    return ApiError.conflict(`Duplicate value for: ${fields}`);
  }

  // Multer upload errors (file size, unexpected field, etc.).
  if (err.name === 'MulterError') {
    return ApiError.badRequest(`Upload error: ${err.message}`);
  }

  // JWT errors.
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return ApiError.unauthorized('Invalid or expired token');
  }

  // Unknown / programmer error -> generic 500, keep original message for logs.
  return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || MESSAGES.INTERNAL_ERROR, {
    isOperational: false,
  });
};

/**
 * Global error-handling middleware. MUST be registered last, after all
 * routes and the 404 handler. Express identifies it by its arity (4 args).
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const error = normalizeError(err);

  if (!error.isOperational) {
    logger.error(
      `Unhandled error on ${req.method} ${req.originalUrl}: ${err.stack || err.message}`
    );
  }

  const body = {
    success: false,
    message: error.isOperational ? error.message : MESSAGES.INTERNAL_ERROR,
  };

  if (error.details) {
    body.errors = error.details;
  }

  // Expose stack traces only outside production to aid debugging.
  if (!env.isProduction && err.stack) {
    body.stack = err.stack;
  }

  res.status(error.statusCode).json(body);
};

module.exports = errorHandler;
