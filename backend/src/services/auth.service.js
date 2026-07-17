'use strict';

const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { signAccessToken } = require('../utils/jwt');
const { rolePermissionKeys, serializeAuthUser } = require('../utils/rbac');
const { generateResetToken, hashResetToken } = require('../utils/reset-token');
const { runInBackground } = require('../utils/background');
const { verifyGoogleIdToken } = require('../utils/google');
const { generateTemporaryPassword } = require('../utils/password');
const emailService = require('./email.service');
const env = require('../config/env');
const { MESSAGES } = require('../constants');

/**
 * Authentication domain logic, decoupled from Express. Functions throw
 * `ApiError` on failure and return plain data; they never touch req/res.
 */

// Populate the role AND its permissions in one go — the whole RBAC chain
// (User → Role → Permissions) is resolved wherever we load a user for auth.
const ROLE_POPULATE = {
  path: 'role',
  populate: { path: 'permissions', select: 'key module action' },
};

/**
 * Validate credentials and issue an access token whose payload carries the
 * user id, role name, and permission keys (per the RBAC spec).
 * @returns {Promise<{ user: object, token: string }>}
 */
const login = async ({ email, password }) => {
  // Password is `select: false`, so pull it in explicitly for verification.
  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password')
    .populate(ROLE_POPULATE);

  // Same generic error for "no such email" and "wrong password" so we don't
  // leak which emails exist.
  if (!user) {
    throw ApiError.unauthorized(MESSAGES.INVALID_CREDENTIALS);
  }

  // Method lock: a Google-activated account can never use email + password.
  // Checked BEFORE the password comparison so the response is deterministic
  // (a scrambled Google password would otherwise just yield INVALID_CREDENTIALS).
  if (user.authMethod === 'GOOGLE') {
    throw ApiError.forbidden(MESSAGES.ACCOUNT_USES_GOOGLE);
  }

  const passwordMatches = await user.comparePassword(password);
  if (!passwordMatches) {
    throw ApiError.unauthorized(MESSAGES.INVALID_CREDENTIALS);
  }

  return { user: serializeAuthUser(user), token: issueToken(user) };
};

/**
 * Sign the application's own access token for a user (role must be populated).
 * Central so both the password and Google flows issue an identical JWT — the
 * Google ID token is NEVER used for app authorization.
 */
const issueToken = (user) =>
  signAccessToken({
    sub: user._id.toString(),
    email: user.email,
    role: user.role?.name,
    roleId: user.role?._id?.toString(),
    isSuperAdmin: !!user.role?.isSuperAdmin,
    permissions: rolePermissionKeys(user.role),
  });

/**
 * Authenticate via Google. The frontend sends a Google ID token; we verify it
 * on the backend, then match it to a PRE-INVITED user by email. We never create
 * an account from Google.
 *
 * Activation model (the permanent one-time choice):
 *  - authMethod === 'LOCAL'  → refuse (this account is email + password only).
 *  - authMethod === 'GOOGLE' → returning Google user; sign in.
 *  - authMethod === null     → first activation via Google: lock to GOOGLE,
 *                              store googleId, activate, and invalidate the
 *                              temporary password so it can never be used.
 *
 * @returns {Promise<{ user: object, token: string }>}
 */
const loginWithGoogle = async ({ idToken }) => {
  const profile = await verifyGoogleIdToken(idToken);

  if (!profile.emailVerified) {
    throw ApiError.unauthorized(MESSAGES.GOOGLE_EMAIL_UNVERIFIED);
  }

  // Match strictly by the verified Google email. Never create a user here.
  const user = await User.findOne({ email: profile.email })
    .select('+password +googleId')
    .populate(ROLE_POPULATE);

  if (!user) {
    throw ApiError.unauthorized(MESSAGES.GOOGLE_EMAIL_MISMATCH);
  }

  // Method lock: a LOCAL-activated account can never use Google.
  if (user.authMethod === 'LOCAL') {
    throw ApiError.forbidden(MESSAGES.ACCOUNT_USES_LOCAL);
  }

  if (user.authMethod === 'GOOGLE') {
    // Returning Google user. Guard against a mismatched subject (same email,
    // different Google account) — practically impossible for a verified email,
    // but we never silently rebind a locked account.
    if (user.googleId && user.googleId !== profile.googleId) {
      throw ApiError.unauthorized(MESSAGES.GOOGLE_EMAIL_MISMATCH);
    }
  } else {
    // authMethod === null → first-time activation via Google.
    user.googleId = profile.googleId;
    user.authMethod = 'GOOGLE';
    user.accountActivated = true;
    user.mustChangePassword = false; // no password step for Google users
    // Invalidate the temporary password: replace it with a fresh random secret
    // the user will never know, re-hashed by the pre-save hook. Defence in depth
    // on top of the authMethod lock.
    user.password = generateTemporaryPassword(32);
    // Clear any pending reset token — irrelevant for a Google account.
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    logger.info(`[auth] Account activated via Google: ${user.email}`);
  }

  return { user: serializeAuthUser(user), token: issueToken(user) };
};

/**
 * Fetch the current user by id with role + permissions populated. Used by the
 * /me endpoint and, on every request, by the auth middleware — so permission
 * changes take effect immediately without re-login.
 * @returns {Promise<object>} the populated user document (password excluded)
 */
const getUserById = async (id) => {
  const user = await User.findById(id).populate(ROLE_POPULATE);
  if (!user) {
    throw ApiError.unauthorized(MESSAGES.USER_NOT_FOUND);
  }
  return user;
};

/**
 * Change the authenticated user's password. Verifies the current password,
 * rejects reusing it, sets the new one (re-hashed by the model's pre-save hook),
 * and clears `mustChangePassword` so the first-login lock is lifted.
 * @returns {Promise<object>} the serialized user (with `mustChangePassword: false`)
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  // Password is `select: false`; pull it in so we can verify the current one.
  const user = await User.findById(userId).select('+password').populate(ROLE_POPULATE);
  if (!user) {
    throw ApiError.unauthorized(MESSAGES.USER_NOT_FOUND);
  }

  const currentMatches = await user.comparePassword(currentPassword);
  if (!currentMatches) {
    throw ApiError.badRequest(MESSAGES.CURRENT_PASSWORD_INVALID);
  }

  // Defence in depth: the validator already rejects identical strings, but guard
  // against the new password matching the stored hash as well.
  const reusesOld = await user.comparePassword(newPassword);
  if (reusesOld) {
    throw ApiError.badRequest(MESSAGES.PASSWORD_SAME);
  }

  user.password = newPassword; // re-hashed on save
  user.mustChangePassword = false; // first-login lock lifted
  // Activation via the LOCAL path: lock the method the first time a user sets
  // their own password. `|| 'LOCAL'` leaves an already-LOCAL account untouched
  // and never overrides a GOOGLE account (which cannot reach change-password).
  user.authMethod = user.authMethod || 'LOCAL';
  user.accountActivated = true;
  await user.save();

  return serializeAuthUser(user);
};

/**
 * Begin the forgot-password flow. Generates a one-time reset token, stores ONLY
 * its hash + expiry, and emails the plaintext token as a reset link. To prevent
 * account enumeration this NEVER reveals whether the email exists — callers always
 * return the same generic message regardless of the outcome. Email failures are
 * logged but not surfaced (again, to avoid leaking existence).
 */
const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    logger.info(`[auth] Password reset requested for unknown email: ${email}`);
    return; // silently succeed — response is identical either way
  }

  const { expiresMinutes } = env.resetPassword;
  const { token, tokenHash, expiresAt } = generateResetToken(expiresMinutes);

  // Persist only the hash + expiry. Skip validation so we don't trip the
  // required-password rule on an existing (already hashed) document.
  user.resetPasswordToken = tokenHash;
  user.resetPasswordExpires = expiresAt;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.app.frontendUrl}/reset-password?token=${token}`;

  // Fire-and-forget (same reasoning as the welcome email): never block the HTTP
  // response on SMTP. The generic success message is returned to the client
  // regardless, so a slow/blocked mail host can't stall or time out the request
  // — and the identical response timing is part of not revealing whether the
  // email exists. `runInBackground` keeps the serverless instance alive until
  // the send settles; without it Vercel may suspend the function on response,
  // freezing the SMTP handshake ("Connection timeout").
  runInBackground(
    emailService
      .sendResetPasswordEmail({
        name: user.name,
        email: user.email,
        resetUrl,
        expiresMinutes,
      })
      .then(() => logger.info(`[auth] Password reset link sent to ${user.email}`))
      .catch((err) =>
        logger.error(`[auth] Failed to send reset email to ${user.email}: ${err.message}`)
      )
  );
};

/**
 * Complete the forgot-password flow. Verifies the token exists, matches (by hash)
 * and has not expired, then sets the new password (re-hashed by the pre-save
 * hook) and clears the reset fields — making the token strictly single-use.
 * Throws 400 on any invalid/expired/used token.
 */
const resetPassword = async ({ token, newPassword }) => {
  const tokenHash = hashResetToken(token);

  // Match the hash AND require a still-future expiry in one query, so an expired
  // token is treated exactly like a non-existent one.
  const user = await User.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+password +resetPasswordToken +resetPasswordExpires');

  if (!user) {
    throw ApiError.badRequest(MESSAGES.PASSWORD_RESET_TOKEN_INVALID);
  }

  user.password = newPassword; // re-hashed by the pre-save hook
  user.mustChangePassword = false; // a self-served password lifts any first-login lock
  user.resetPasswordToken = undefined; // clear immediately → single-use
  user.resetPasswordExpires = undefined;
  await user.save();

  logger.info(`[auth] Password reset completed for ${user.email}`);
};

module.exports = {
  login,
  loginWithGoogle,
  getUserById,
  changePassword,
  requestPasswordReset,
  resetPassword,
  ROLE_POPULATE,
};
