'use strict';

const path = require('path');
const multer = require('multer');
const env = require('./env');
const { HTTP_STATUS } = require('../constants/httpStatus');
const ApiError = require('../utils/ApiError');

/**
 * Multer configured with MEMORY storage.
 *
 * Files are held in `req.file.buffer` / `req.files[].buffer` and never touch
 * disk. Downstream services stream the buffer straight to Cloudinary.
 *
 * NOTE: This exports the configured middleware factory only. Actual upload
 * routes are intentionally NOT wired up yet — business modules will consume it.
 */
const storage = multer.memoryStorage();

// Allow-list of mime types for the asset kinds this system handles.
const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  pdf: ['application/pdf'],
  // Microsoft Word .docx. Some browsers/OSes report a generic type, so a few
  // tolerated fallbacks are allowed — but only ever together with a .docx ext.
  docx: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
    'application/zip',
  ],
};

const buildFileFilter = (allowed) => (_req, file, cb) => {
  if (allowed.includes(file.mimetype)) {
    return cb(null, true);
  }
  return cb(
    new ApiError(
      HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE,
      `Unsupported file type "${file.mimetype}". Allowed: ${allowed.join(', ')}`
    )
  );
};

const createUploader = (allowed) =>
  multer({
    storage,
    limits: { fileSize: env.upload.maxFileSizeBytes },
    fileFilter: buildFileFilter(allowed),
  });

/**
 * Word (.docx) file filter — requires BOTH a `.docx` extension and an allowed
 * Word MIME type, rejecting everything else (renamed PDFs, images, etc.).
 */
const docxFileFilter = (_req, file, cb) => {
  const hasDocxExt = path.extname(file.originalname).toLowerCase() === '.docx';
  const hasWordMime = ALLOWED_MIME_TYPES.docx.includes(file.mimetype);
  if (hasDocxExt && hasWordMime) {
    return cb(null, true);
  }
  return cb(
    new ApiError(
      HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE,
      'Only Microsoft Word (.docx) files are allowed'
    )
  );
};

const docxUploader = multer({
  storage,
  limits: { fileSize: env.upload.maxFileSizeBytes },
  fileFilter: docxFileFilter,
});

module.exports = {
  storage,
  ALLOWED_MIME_TYPES,
  // Ready-to-use uploaders: Products (images) and Templates (Word .docx).
  imageUploader: createUploader(ALLOWED_MIME_TYPES.image),
  pdfUploader: createUploader(ALLOWED_MIME_TYPES.pdf),
  docxUploader,
  createUploader,
};
