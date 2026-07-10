'use strict';

/**
 * Wraps an async Express handler so any rejected promise is forwarded to
 * `next()` and picked up by the global error handler. Removes the need for
 * try/catch in every controller.
 *
 * @param {import('express').RequestHandler} fn
 * @returns {import('express').RequestHandler}
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
