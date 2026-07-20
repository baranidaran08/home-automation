'use strict';

const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { signAccessToken } = require('../utils/jwt');
const { rolePermissionKeys, serializeAuthUser } = require('../utils/rbac');
const { generateResetToken, hashResetToken } = require('../utils/reset-token');
const { runInBackground } = require('../utils/background');
const { verifyGoogleIdToken } = require('../utils/google');
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

  const passwordMatches = await user.comparePassword(password);
  if (!passwordMatches) {
    throw ApiError.unauthorized(MESSAGES.INVALID_CREDENTIALS);
  }

  await recordLogin(user);
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
 * Authenticate via Google — an ALTERNATIVE way into the SAME account, not a
 * separate identity. The frontend sends a Google ID token; we verify it on the
 * backend, then match a PRE-INVITED user by their verified email. There is no
 * method locking: a user may freely use either Email/Password or Google.
 *
 * Rules:
 *  - Never auto-create an account — the email must already exist (created by an
 *    admin), else we reject.
 *  - The account must be activated first (the invitation flow requires setting a
 *    password on first login). Google is only offered after that, so we refuse a
 *    still-pending account rather than bypass the required password change.
 *  - The Google `sub` is recorded on the user for reference; it is never used to
 *    restrict which method the user may sign in with.
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
    .select('+googleId')
    .populate(ROLE_POPULATE);

  if (!user) {
    throw ApiError.unauthorized(MESSAGES.GOOGLE_EMAIL_MISMATCH);
  }

  // Activation is password-based (invitation flow): a user still holding a
  // temporary password must activate with it first, then Google becomes available.
  if (user.mustChangePassword) {
    throw ApiError.forbidden(MESSAGES.GOOGLE_ACCOUNT_NOT_ACTIVATED);
  }

  // Record the Google subject for reference the first time we see it. Purely
  // informational — it never gates which sign-in method is allowed.
  if (user.googleId !== profile.googleId) {
    user.googleId = profile.googleId;
    await user.save({ validateBeforeSave: false });
  }

  await recordLogin(user);
  return { user: serializeAuthUser(user), token: issueToken(user) };
};

/**
 * Stamp the most-recent successful sign-in. Written with a targeted `updateOne`
 * (not `save`) so it never re-triggers the password-hash hook or validation, and
 * mirrored onto the in-memory doc so the value we serialise back is current.
 * Best-effort: a failed write must never block an otherwise valid login.
 */
const recordLogin = async (user) => {
  const now = new Date();
  try {
    await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: now } });
    user.lastLoginAt = now;
  } catch (err) {
    logger.warn(`[auth] Failed to record lastLoginAt for ${user.email}: ${err.message}`);
  }
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
 * and clears `mustChangePassword` — which activates the account.
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
  user.mustChangePassword = false; // first-login lock lifted → account activated
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
