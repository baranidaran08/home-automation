'use strict';

const crypto = require('crypto');

/**
 * Password-reset token helpers. The plaintext token is emailed to the user; only
 * its SHA-256 hash is ever stored in MongoDB, so a database leak cannot be used
 * to reset anyone's password. SHA-256 (fast, deterministic) is appropriate here
 * because the token is already high-entropy random — unlike passwords, it needs
 * no slow salted hash. We never use JWT for reset tokens.
 */

/** Deterministically hash a plaintext reset token for storage / lookup. */
const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Generate a single-use reset token.
 * @param {number} expiresMinutes minutes until the token expires
 * @returns {{ token: string, tokenHash: string, expiresAt: Date }}
 *   `token` (plaintext, emailed to the user), `tokenHash` (stored), `expiresAt`.
 */
const generateResetToken = (expiresMinutes) => {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);
  return { token, tokenHash, expiresAt };
};

module.exports = { hashResetToken, generateResetToken };
