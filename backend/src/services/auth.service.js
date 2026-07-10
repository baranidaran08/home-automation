'use strict';

const Admin = require('../models/admin.model');
const ApiError = require('../utils/ApiError');
const { signAccessToken } = require('../utils/jwt');
const { MESSAGES } = require('../constants');

/**
 * Authentication domain logic, decoupled from Express. Functions throw
 * `ApiError` on failure and return plain data; they never touch req/res.
 */

/**
 * Validate credentials and issue an access token.
 * @returns {Promise<{ admin: object, token: string }>}
 */
const login = async ({ email, password }) => {
  // Password is `select: false`, so pull it in explicitly for verification.
  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');

  // Use the same generic error for "no such email" and "wrong password" so we
  // don't leak which emails exist.
  if (!admin) {
    throw ApiError.unauthorized(MESSAGES.INVALID_CREDENTIALS);
  }

  const passwordMatches = await admin.comparePassword(password);
  if (!passwordMatches) {
    throw ApiError.unauthorized(MESSAGES.INVALID_CREDENTIALS);
  }

  const token = signAccessToken({
    sub: admin._id.toString(),
    role: admin.role,
    email: admin.email,
  });

  // `toJSON` strips the password/__v.
  return { admin: admin.toJSON(), token };
};

/**
 * Fetch the current admin by id (used by the /me endpoint and auth middleware).
 * @returns {Promise<object>} the admin document (password excluded)
 */
const getAdminById = async (id) => {
  const admin = await Admin.findById(id);
  if (!admin) {
    throw ApiError.unauthorized(MESSAGES.ADMIN_NOT_FOUND);
  }
  return admin;
};

module.exports = { login, getAdminById };
