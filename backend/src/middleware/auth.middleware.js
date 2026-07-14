'use strict';

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/jwt');
const { rolePermissionKeys } = require('../utils/rbac');
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
 * Guard for private routes. Verifies the token, then RE-LOADS the user with its
 * role + permissions from the database (rather than trusting the token's cached
 * claims) so role/permission edits take effect on the very next request without
 * forcing a re-login. Attaches `req.user`, `req.permissionKeys` (a Set), and
 * `req.isSuperAdmin`. Throws 401 on any failure.
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

  // Ensure the account still exists and resolve its CURRENT permissions.
  const user = await authService.getUserById(payload.sub);
  req.user = user;
  req.token = token;
  req.isSuperAdmin = !!user.role?.isSuperAdmin;
  req.permissionKeys = new Set(rolePermissionKeys(user.role));
  return next();
});

/**
 * Permission guard factory. Usage:
 *   router.post('/', authorize(PERMS.products.create), validate(...), ctrl.create);
 *
 * Allows the request when the user is a Super Admin (wildcard) or their role
 * grants the exact permission key; otherwise responds 403 Forbidden. `authorize`
 * and `requirePermission` are aliases.
 */
const authorize = (permissionKey) => (req, _res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized(MESSAGES.UNAUTHORIZED));
  }
  // First-login lock: a user still holding a temporary password may not touch any
  // permission-guarded module route until they set their own password. This gates
  // EVERY protected module (they all use `authorize`), while /auth/change-password,
  // /auth/me and /auth/logout use only `authenticate`, so they stay reachable.
  if (req.user.mustChangePassword) {
    return next(ApiError.forbidden(MESSAGES.PASSWORD_CHANGE_REQUIRED));
  }
  if (req.isSuperAdmin || !permissionKey || req.permissionKeys?.has(permissionKey)) {
    return next();
  }
  return next(ApiError.forbidden(MESSAGES.FORBIDDEN));
};

module.exports = { authenticate, authorize, requirePermission: authorize };
