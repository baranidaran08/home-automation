'use strict';

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/auth.service');
const { setAuthCookie, clearAuthCookie } = require('../utils/cookie');
const { MESSAGES } = require('../constants');

/**
 * POST /api/v1/auth/login
 * Validates credentials, sets the JWT as an httpOnly cookie, and returns the
 * admin profile. The token is intentionally NOT returned in the body — it
 * lives only in the httpOnly cookie.
 */
const login = asyncHandler(async (req, res) => {
  const { admin, token } = await authService.login(req.body);
  setAuthCookie(res, token);
  return ApiResponse.ok(res, { admin }, MESSAGES.LOGIN_SUCCESS);
});

/**
 * POST /api/v1/auth/logout
 * Clears the auth cookie. Safe to call whether or not a session exists.
 */
const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  return ApiResponse.ok(res, null, MESSAGES.LOGOUT_SUCCESS);
});

/**
 * GET /api/v1/auth/me   (protected)
 * Returns the currently authenticated admin (attached by `authenticate`).
 */
const getCurrentAdmin = asyncHandler(async (req, res) => {
  return ApiResponse.ok(res, { admin: req.admin.toJSON() }, MESSAGES.CURRENT_ADMIN_FETCHED);
});

module.exports = { login, logout, getCurrentAdmin };
