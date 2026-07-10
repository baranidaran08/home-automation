'use strict';

const { cloudinary } = require('../config/cloudinary');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { MESSAGES } = require('../constants');

/**
 * Cloudinary asset service. Implements the buffer half of the upload flow:
 *   Multer (memory buffer) -> Cloudinary -> { publicId, secureUrl } -> MongoDB
 *
 * Nothing is written to the server disk — buffers are streamed directly.
 * `resource_type` is 'image' for product photos and 'raw' for documents
 * (Word .docx templates).
 */

/** Upload a single in-memory buffer. Returns the raw Cloudinary result. */
const uploadBufferRaw = (buffer, folder, resourceType) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Empty Cloudinary response'));
        }
        return resolve(result);
      }
    );
    stream.end(buffer);
  });

/** Upload an image buffer, resolving to the stored asset ref. */
const uploadBuffer = async (buffer, folder, resourceType = 'image') => {
  const result = await uploadBufferRaw(buffer, folder, resourceType);
  return { publicId: result.public_id, secureUrl: result.secure_url };
};

/** Upload many Multer image files; returns an array of { publicId, secureUrl }. */
const uploadMany = async (files = [], subfolder = 'products') => {
  if (!files.length) return [];
  const folder = `${env.cloudinary.folder}/${subfolder}`;
  try {
    return await Promise.all(files.map((file) => uploadBuffer(file.buffer, folder)));
  } catch (err) {
    logger.error(`[cloudinary] upload failed: ${err.message}`);
    throw ApiError.internal(MESSAGES.IMAGE_UPLOAD_FAILED);
  }
};

/**
 * Upload a single non-image document (PDF, .docx, …) as a Cloudinary `raw`
 * asset. Returns publicId, secureUrl and the original filename.
 */
const uploadRawFile = async (file, subfolder = 'templates') => {
  const folder = `${env.cloudinary.folder}/${subfolder}`;
  try {
    const result = await uploadBufferRaw(file.buffer, folder, 'raw');
    return {
      publicId: result.public_id,
      secureUrl: result.secure_url,
      originalFileName: file.originalname,
    };
  } catch (err) {
    logger.error(`[cloudinary] raw file upload failed: ${err.message}`);
    throw ApiError.internal(MESSAGES.TEMPLATE_UPLOAD_FAILED);
  }
};

/** Delete a single asset by publicId. Best-effort (errors logged, not thrown). */
const destroy = async (publicId, resourceType = 'image') => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    logger.warn(`[cloudinary] destroy failed for "${publicId}": ${err.message}`);
  }
};

/** Delete many assets by publicId (best-effort, parallel). */
const destroyMany = async (publicIds = [], resourceType = 'image') => {
  await Promise.all(publicIds.map((id) => destroy(id, resourceType)));
};

/**
 * Build a "force download" URL by injecting the `fl_attachment` flag after
 * `/upload/`. Cloudinary then serves the asset with Content-Disposition:
 * attachment so the browser downloads instead of previewing it.
 */
const toAttachmentUrl = (secureUrl) => {
  if (!secureUrl || !secureUrl.includes('/upload/')) return secureUrl;
  return secureUrl.replace('/upload/', '/upload/fl_attachment/');
};

module.exports = {
  uploadBuffer,
  uploadMany,
  uploadRawFile,
  destroy,
  destroyMany,
  toAttachmentUrl,
};
