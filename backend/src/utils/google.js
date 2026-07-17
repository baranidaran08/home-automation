'use strict';

const { OAuth2Client } = require('google-auth-library');
const env = require('../config/env');
const ApiError = require('./ApiError');
const logger = require('./logger');
const { MESSAGES } = require('../constants');

/**
 * Google ID-token verification — the ONLY place Google is trusted.
 *
 * We use Google's official library to verify the token's signature, expiry,
 * audience (our client id) and issuer. We never trust anything the frontend
 * sends beyond the raw ID token, and we never use the Google token for
 * application authorization — the app issues its own JWT afterwards.
 *
 * A single reusable client (no secret needed for ID-token verification).
 */
const client = new OAuth2Client(env.google.clientId);

/**
 * Verify a Google ID token and return the trusted profile claims.
 *
 * @param {string} idToken the credential JWT from Google Identity Services
 * @returns {Promise<{ googleId: string, email: string, emailVerified: boolean, name: string, picture: string }>}
 * @throws {ApiError} 503 if Google is not configured; 401 on any invalid token
 */
const verifyGoogleIdToken = async (idToken) => {
  if (!env.google.clientId) {
    logger.error('[google] GOOGLE_CLIENT_ID is not set — cannot verify ID tokens.');
    throw ApiError.serviceUnavailable(MESSAGES.GOOGLE_NOT_CONFIGURED);
  }

  let ticket;
  try {
    // verifyIdToken checks signature, expiry (`exp`), audience (`aud` === our
    // client id) and issuer (`iss` is accounts.google.com) in one call.
    ticket = await client.verifyIdToken({ idToken, audience: env.google.clientId });
  } catch (err) {
    logger.warn(`[google] ID token verification failed: ${err.message}`);
    throw ApiError.unauthorized(MESSAGES.GOOGLE_AUTH_FAILED);
  }

  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email) {
    throw ApiError.unauthorized(MESSAGES.GOOGLE_AUTH_FAILED);
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    emailVerified: payload.email_verified === true,
    name: payload.name || '',
    picture: payload.picture || '',
  };
};

module.exports = { verifyGoogleIdToken };
