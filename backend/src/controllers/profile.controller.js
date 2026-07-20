'use strict';

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const userService = require('../services/user.service');
const authService = require('../services/auth.service');
const { serializeAuthUser } = require('../utils/rbac');
const { MESSAGES } = require('../constants');

/**
 * PATCH /api/profile   (protected)
 * Lets the authenticated user update their OWN profile — name, email, phone, and
 * profile picture (JSON, or multipart with an `avatar` file). Reuses the user
 * service's field/avatar logic scoped to the caller, then returns the refreshed
 * session user (role + permissions) so the client can update its auth store in
 * place. Never touches role, password, or another account.
 */
const updateProfile = asyncHandler(async (req, res) => {
  await userService.updateProfile(req.user._id, req.body, req.file);
  // Re-load with role + permissions populated so the response matches the shape
  // returned by /auth/me (the client stores this straight into the auth store).
  const user = await authService.getUserById(req.user._id);
  return ApiResponse.ok(res, { user: serializeAuthUser(user) }, MESSAGES.PROFILE_UPDATED);
});

module.exports = { updateProfile };
