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

  // DOCX -> PDF conversion. When an API key is present the conversion is done
  // remotely over HTTPS (required on serverless hosts, which cannot run the
  // LibreOffice binary); when absent we fall back to a local LibreOffice install,
  // which keeps local development working offline with no key.
  cloudconvert: {
    apiKey: optional('CLOUDCONVERT_API_KEY', ''),
  },

  // Outbound email (SMTP). All optional so the app still boots without mail
  // configured — the email service checks `isConfigured` and skips sending if
  // credentials are missing, and a send failure never breaks the request.
  // For Gmail, SMTP_PASS must be a 16-character App Password (not the account
  // password) with 2-Step Verification enabled.
  smtp: {
    host: optional('SMTP_HOST', 'smtp.gmail.com'),
    port: parseInt(optional('SMTP_PORT', '587'), 10),
    user: optional('SMTP_USER', ''),
    pass: optional('SMTP_PASS', ''),
    // Address shown in the "From" header; defaults to the authenticated user.
    from: optional('SMTP_FROM', ''),
  },

  // Public URLs used inside emails (e.g. the login link in the welcome email).
  app: {
    loginUrl: optional('APP_LOGIN_URL', 'http://localhost:3000/login'),
    // Base URL of the frontend, used to build links inside emails (e.g. the
    // password-reset URL: `${frontendUrl}/reset-password?token=...`).
    frontendUrl: optional('FRONTEND_URL', 'http://localhost:3000'),
  },

  // Password-reset one-time tokens (hashed at rest; single-use).
  resetPassword: {
    expiresMinutes: parseInt(optional('RESET_PASSWORD_EXPIRES_MINUTES', '15'), 10),
  },
};

module.exports = env;
