'use strict';

const env = require('../config/env');

/** Base options shared by set/clear so the cookie can always be matched. */
const baseCookieOptions = () => {
  const options = {
    httpOnly: true, // not readable by client-side JS — mitigates XSS token theft
    secure: env.cookie.secure, // HTTPS-only in production
    sameSite: env.cookie.sameSite,
    path: '/',
  };
  if (env.cookie.domain) {
    options.domain = env.cookie.domain;
  }
  return options;
};

/** Attach the JWT to the response as an httpOnly cookie. */
const setAuthCookie = (res, token) => {
  res.cookie(env.cookie.name, token, {
    ...baseCookieOptions(),
    maxAge: env.cookie.maxAgeMs,
  });
};

/** Remove the auth cookie (logout). */
const clearAuthCookie = (res) => {
  res.clearCookie(env.cookie.name, baseCookieOptions());
};

module.exports = { setAuthCookie, clearAuthCookie };
