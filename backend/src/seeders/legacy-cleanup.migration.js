'use strict';

const User = require('../models/user.model');
const logger = require('../utils/logger');

/**
 * Idempotent cleanup of fields written by earlier versions of the auth feature
 * that are no longer part of the schema. Runs on every startup; each step only
 * matches rows that still need fixing and becomes a no-op once they're clean.
 */

/**
 * Drop the retired permanent-method fields. Google is now just an alternative
 * sign-in for the same account — there is no `authMethod` lock and activation is
 * tracked solely by `mustChangePassword`, so `accountActivated` is redundant.
 * `$unset` removes both fields from any document that still carries them.
 */
const dropObsoleteAuthFields = async () => {
  const result = await User.updateMany(
    { $or: [{ authMethod: { $exists: true } }, { accountActivated: { $exists: true } }] },
    { $unset: { authMethod: '', accountActivated: '' } }
  );
  const changed = result.modifiedCount ?? 0;
  if (changed > 0) {
    logger.info(`[seed] ✓ Removed obsolete authMethod/accountActivated on ${changed} user(s).`);
  }
};

/**
 * Remove explicit `googleId: null` values written by an even earlier version
 * that defaulted the field to null. A sparse UNIQUE index still indexes explicit
 * nulls, so more than one such user collides ("Duplicate value for: googleId").
 * Unsetting the field takes those users out of the sparse index; real Google ids
 * (strings) are never matched by `{ googleId: null }`, so they're untouched.
 */
const cleanupNullGoogleIds = async () => {
  const result = await User.updateMany({ googleId: null }, { $unset: { googleId: '' } });
  const changed = result.modifiedCount ?? 0;
  if (changed > 0) {
    logger.info(`[seed] ✓ Cleared null googleId on ${changed} user(s).`);
  }
};

module.exports = { dropObsoleteAuthFields, cleanupNullGoogleIds };
