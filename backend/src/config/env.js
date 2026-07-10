'use strict';

const dotenv = require('dotenv');
const path = require('path');

// Load .env from the backend root regardless of the current working directory.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Read a required environment variable and fail fast when it is missing.
 * Keeps misconfiguration errors loud instead of surfacing deep inside a request.
 */
const required = (key) => {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const optional = (key, fallback) => {
  const value = process.env[key];
  return value === undefined || value === '' ? fallback : value;
};

const NODE_ENV = optional('NODE_ENV', 'development');

/**
 * Central, typed-ish view of all configuration. Import this instead of
 * touching `process.env` directly anywhere else in the codebase.
 */
const env = {
  nodeEnv: NODE_ENV,
  isProduction: NODE_ENV === 'production',
  isDevelopment: NODE_ENV === 'development',
  isTest: NODE_ENV === 'test',

  port: parseInt(optional('PORT', '5000'), 10),
  apiVersion: optional('API_VERSION', 'v1'),

  corsOrigin: optional('CORS_ORIGIN', 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  mongoUri: required('MONGODB_URI'),

  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: optional('JWT_EXPIRES_IN', '7d'),
    refreshSecret: optional('JWT_REFRESH_SECRET', required('JWT_SECRET')),
    refreshExpiresIn: optional('JWT_REFRESH_EXPIRES_IN', '30d'),
  },

  // httpOnly auth cookie. `sameSite: none` + `secure` is required in production
  // when the frontend and API live on different sites; `lax` is fine for local
  // same-site development (localhost:3000 <-> localhost:5000).
  cookie: {
    name: optional('AUTH_COOKIE_NAME', 'ha_access_token'),
    maxAgeMs: parseInt(optional('AUTH_COOKIE_MAX_AGE_DAYS', '7'), 10) * 24 * 60 * 60 * 1000,
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
    domain: optional('AUTH_COOKIE_DOMAIN', ''),
  },

  // Default admin used by the seeder. Credentials live in env — never in code.
  admin: {
    name: optional('ADMIN_NAME', 'System Administrator'),
    email: optional('ADMIN_EMAIL', 'admin@homeautomation.local'),
    password: optional('ADMIN_PASSWORD', 'Admin@12345'),
  },

  bcrypt: {
    saltRounds: parseInt(optional('BCRYPT_SALT_ROUNDS', '12'), 10),
  },

  cloudinary: {
    cloudName: optional('CLOUDINARY_CLOUD_NAME', ''),
    apiKey: optional('CLOUDINARY_API_KEY', ''),
    apiSecret: optional('CLOUDINARY_API_SECRET', ''),
    folder: optional('CLOUDINARY_FOLDER', 'home-automation'),
  },

  upload: {
    maxFileSizeBytes: parseInt(optional('MAX_FILE_SIZE_MB', '10'), 10) * 1024 * 1024,
  },
};

module.exports = env;
