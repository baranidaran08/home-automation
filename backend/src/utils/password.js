'use strict';

const crypto = require('crypto');

/**
 * Cryptographically-secure temporary-password generator. Used when a Super Admin
 * creates an employee: the backend — never a human — mints the first password, so
 * it is always high-entropy and unguessable. `crypto.randomInt` draws from the OS
 * CSPRNG (unlike `Math.random`, which is predictable and unsafe for secrets).
 *
 * The generated plaintext lives only in memory long enough to be hashed (by the
 * User model's pre-save hook) and emailed to the employee, then it is discarded.
 */

// Character classes. Visually ambiguous characters (0/O, 1/l/I) are omitted so a
// user reading the password out of an email can't mistype it.
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnpqrstuvwxyz';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%^&*-_=+';
const ALL = UPPER + LOWER + DIGITS + SYMBOLS;

/** Pick one random character from a charset using the CSPRNG. */
const randomChar = (charset) => charset[crypto.randomInt(charset.length)];

/**
 * Generate a temporary password that always contains at least one upper, lower,
 * digit and symbol (so it satisfies any complexity policy), then fills the rest
 * from the full alphabet and shuffles so the guaranteed classes aren't predictably
 * positioned.
 *
 * @param {number} [length=14] desired length (clamped to a minimum of 12)
 * @returns {string} the plaintext temporary password
 */
const generateTemporaryPassword = (length = 14) => {
  const target = Math.max(length, 12);

  // Guarantee one of each class, then top up from the full alphabet.
  const chars = [randomChar(UPPER), randomChar(LOWER), randomChar(DIGITS), randomChar(SYMBOLS)];
  while (chars.length < target) chars.push(randomChar(ALL));

  // Fisher–Yates shuffle with crypto randomness so the first four positions
  // aren't always upper/lower/digit/symbol.
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
};

module.exports = { generateTemporaryPassword };
