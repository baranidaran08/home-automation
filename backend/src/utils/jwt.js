'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Sign a short JSON payload into a JWT access token. Carries the user id, role
 * and permission keys for the RBAC system — never embed sensitive data such as
 * password hashes. Note: the auth middleware re-resolves permissions from the
 * DB on each request, so these claims are a convenience, not the source of truth.
 *
 * @param {{ sub: string, role?: string, roleId?: string, email?: string,
 *           isSuperAdmin?: boolean, permissions?: string[] }} payload
 */
const signAccessToken = (payload) =>
  jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });

/**
 * Verify and decode an access token. Throws (JsonWebTokenError /
 * TokenExpiredError) on failure — handled centrally by the error handler.
 */
const verifyAccessToken = (token) => jwt.verify(token, env.jwt.secret);

module.exports = { signAccessToken, verifyAccessToken };
