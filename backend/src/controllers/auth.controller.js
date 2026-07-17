'use strict';

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/auth.service');
const { serializeAuthUser } = require('../utils/rbac');
const { setAuthCookie, clearAuthCookie } = require('../utils/cookie');
const { MESSAGES } = require('../constants');

/**
 * POST /api/auth/login
 * Validates credentials, sets the JWT as an httpOnly cookie, and returns the
 * user profile (with role + permissions). The token is intentionally NOT
 * returned in the body — it lives only in the httpOnly cookie.
 */
const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  setAuthCookie(res, token);
  return ApiResponse.ok(res, { user }, MESSAGES.LOGIN_SUCCESS);
});

/**
 * POST /api/auth/google
 * Authenticates a pre-invited user via a Google ID token. The token is verified
 * on the backend; on success the app issues its OWN JWT (as an httpOnly cookie)
 * exactly like password login. Never creates a user.
 */
const googleLogin = asyncHandler(async (req, res) => {
  const { user, token } = await authService.loginWithGoogle(req.body);
  setAuthCookie(res, token);
  return ApiResponse.ok(res, { user }, MESSAGES.GOOGLE_LOGIN_SUCCESS);
});

/**
 * POST /api/auth/logout
 * Clears the auth cookie. Safe to call whether or not a session exists.
 */
const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  return ApiResponse.ok(res, null, MESSAGES.LOGOUT_SUCCESS);
});

/**
 * GET /api/auth/me   (protected)
 * Returns the currently authenticated user, including their live role and
 * permission keys (attached/resolved by `authenticate`).
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  return ApiResponse.ok(res, { user: serializeAuthUser(req.user) }, MESSAGES.CURRENT_USER_FETCHED);
});

/**
 * POST /api/auth/change-password   (protected)
 * Lets the authenticated user replace their (temporary) password. On success the
 * `mustChangePassword` lock is cleared and the updated user is returned so the
 * client can refresh its session and leave the change-password screen.
 */
const changePassword = asyncHandler(async (req, res) => {
  const user = await authService.changePassword(req.user._id, req.body);
  return ApiResponse.ok(res, { user }, MESSAGES.PASSWORD_CHANGED);
});

/**
 * POST /api/auth/forgot-password   (public)
 * Starts the reset flow. Always responds with the same generic message so it can
 * never be used to discover which emails are registered.
 */
const forgotPassword = asyncHandler(async (req, res) => {
  await authService.requestPasswordReset(req.body.email);
  return ApiResponse.ok(res, null, MESSAGES.PASSWORD_RESET_REQUESTED);
});

/**
 * POST /api/auth/reset-password   (public)
 * Completes the reset flow using the one-time token from the email link.
 */
const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  return ApiResponse.ok(res, null, MESSAGES.PASSWORD_RESET_SUCCESS);
});

module.exports = {
  login,
  googleLogin,
  logout,
  getCurrentUser,
  changePassword,
  forgotPassword,
  resetPassword,
};
