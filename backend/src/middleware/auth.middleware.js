'use strict';

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/jwt');
const authService = require('../services/auth.service');
const env = require('../config/env');
const { MESSAGES } = require('../constants');

/**
 * Extract the JWT from the httpOnly cookie first, then fall back to the
 * `Authorization: Bearer <token>` header (useful for API clients / tests).
 */
const extractToken = (req) => {
  const cookieToken = req.cookies?.[env.cookie.name];
  if (cookieToken) return cookieToken;

  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice('Bearer '.length).trim();
  }
  return null;
};

/**
 * Guard for private routes. Verifies the token, confirms the admin still
 * exists, and attaches it as `req.admin`. Throws 401 on any failure.
 */
const authenticate = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) {
    throw ApiError.unauthorized(MESSAGES.TOKEN_MISSING);
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    // Normalise jwt errors to a single, non-leaky 401.
    throw ApiError.unauthorized(MESSAGES.TOKEN_INVALID);
  }

  // Ensure the account referenced by the token still exists.
  req.admin = await authService.getAdminById(payload.sub);
  req.token = token;
  return next();
});

/**
 * Role guard factory. Usage: `router.use(authenticate, authorize(ROLES.ADMIN))`.
 * Included for forward-compatibility; the single-admin app only uses `admin`.
 */
const authorize =
  (...allowedRoles) =>
  (req, _res, next) => {
    if (!req.admin || (allowedRoles.length && !allowedRoles.includes(req.admin.role))) {
      return next(ApiError.forbidden(MESSAGES.FORBIDDEN));
    }
    return next();
  };

module.exports = { authenticate, authorize };
