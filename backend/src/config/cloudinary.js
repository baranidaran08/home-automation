'use strict';

const { v2: cloudinary } = require('cloudinary');
const env = require('./env');
const logger = require('../utils/logger');

/**
 * Configure the Cloudinary SDK once at startup.
 *
 * Upload flow (implemented in future modules):
 *   Frontend -> Express -> Multer (memory) -> Cloudinary -> MongoDB
 *
 * Multer keeps the file in a Buffer (see config/multer.js); the buffer is
 * streamed to Cloudinary and only the resulting secure URL / public_id is
 * persisted to MongoDB. No files are written to the server's disk.
 */
const configureCloudinary = () => {
  const { cloudName, apiKey, apiSecret } = env.cloudinary;

  if (!cloudName || !apiKey || !apiSecret) {
    logger.warn(
      'Cloudinary credentials are not fully set. Uploads will fail until CLOUDINARY_* env vars are configured.'
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
};

module.exports = { cloudinary, configureCloudinary };
