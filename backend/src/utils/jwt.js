'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Sign a short JSON payload into a JWT access token. Keep the payload minimal
 * (subject + role) — never embed sensitive data such as password hashes.
 *
 * @param {{ sub: string, role: string, email?: string }} payload
 */
const signAccessToken = (payload) =>
  jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });

/**
 * Verify and decode an access token. Throws (JsonWebTokenError /
 * TokenExpiredError) on failure — handled centrally by the error handler.
 */
const verifyAccessToken = (token) => jwt.verify(token, env.jwt.secret);

module.exports = { signAccessToken, verifyAccessToken };
