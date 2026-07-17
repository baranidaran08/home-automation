'use strict';

const User = require('../models/user.model');
const logger = require('../utils/logger');

/**
 * One-time (idempotent) backfill for the authentication-method feature.
 *
 * Accounts created before `authMethod` existed default to `authMethod: null`,
 * which now means "invited, may still choose either method". That is wrong for
 * users who ALREADY activated under the old password-only flow — leaving them
 * `null` would let anyone controlling their email address activate the account
 * via Google and hijack it.
 *
 * We distinguish activated legacy users by `mustChangePassword === false`: they
 * completed the forced password change (or are the seeded Root), so they are
 * LOCAL users. We lock them to LOCAL and mark them activated.
 *
 * Users still holding a temporary password (`mustChangePassword === true`) are
 * intentionally left `null` — they have NOT activated yet and should get the new
 * one-time choice between Email/Password and Google.
 *
 * Safe to run on every startup: it only touches rows that still match the filter,
 * and once updated they no longer do.
 */
const backfillAuthMethod = async () => {
  const result = await User.updateMany(
    { authMethod: null, mustChangePassword: false },
    { $set: { authMethod: 'LOCAL', accountActivated: true } }
  );

  const changed = result.modifiedCount ?? 0;
  if (changed > 0) {
    logger.info(`[seed] ✓ Backfilled authMethod=LOCAL for ${changed} existing user(s).`);
  }
};

module.exports = { backfillAuthMethod };
