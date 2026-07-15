'use strict';

const { promisify } = require('util');
const libre = require('libreoffice-convert');
const env = require('../config/env');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const { MESSAGES } = require('../constants');

/**
 * DOCX -> PDF conversion, with two interchangeable strategies:
 *
 *  - REMOTE (CloudConvert, over HTTPS) when `CLOUDCONVERT_API_KEY` is set. This
 *    is required on serverless hosts (Vercel), whose containers ship no system
 *    packages and therefore cannot spawn the LibreOffice `soffice` binary.
 *  - LOCAL (libreoffice-convert) otherwise, so development keeps working offline
 *    with no API key and no per-conversion cost.
 *
 * Output fidelity matches between the two: CloudConvert renders Office formats
 * with LibreOffice as well, so the produced PDF is the same as a local run.
 *
 * This module is the ONLY place that knows how conversion happens — callers just
 * hand over a .docx buffer and get a .pdf buffer back.
 */

const convertLocal = promisify(libre.convert);

const CLOUDCONVERT_API = 'https://api.cloudconvert.com/v2';

/** True when remote conversion is configured. */
const isRemoteConfigured = () => Boolean(env.cloudconvert.apiKey);

/** Authenticated CloudConvert JSON request. Throws with the API's own message. */
const ccFetch = async (path, options = {}) => {
  const res = await fetch(`${CLOUDCONVERT_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${env.cloudconvert.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`CloudConvert ${path} -> ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json();
};

/**
 * Convert via CloudConvert. The whole thing is one job with three chained tasks,
 * so the .docx never needs a separate upload round-trip:
 *   import/base64 (inline the file) -> convert (docx→pdf) -> export/url (download link)
 */
const convertRemote = async (docxBuffer) => {
  const { data: job } = await ccFetch('/jobs', {
    method: 'POST',
    body: JSON.stringify({
      tasks: {
        'import-file': {
          operation: 'import/base64',
          file: docxBuffer.toString('base64'),
          filename: 'quotation.docx',
        },
        'convert-file': {
          operation: 'convert',
          input: 'import-file',
          input_format: 'docx',
          output_format: 'pdf',
        },
        'export-file': { operation: 'export/url', input: 'convert-file' },
      },
    }),
  });

  // `/wait` blocks until the job settles — avoids a hand-rolled polling loop.
  const { data: finished } = await ccFetch(`/jobs/${job.id}/wait`);

  if (finished.status !== 'finished') {
    const reason = (finished.tasks || [])
      .filter((t) => t.status === 'error')
      .map((t) => t.message)
      .join('; ');
    throw new Error(`CloudConvert job ${finished.status}: ${reason || 'unknown error'}`);
  }

  const exportTask = (finished.tasks || []).find((t) => t.name === 'export-file');
  const url = exportTask?.result?.files?.[0]?.url;
  if (!url) throw new Error('CloudConvert finished but returned no export URL');

  const fileRes = await fetch(url);
  if (!fileRes.ok) {
    throw new Error(`CloudConvert PDF download failed (${fileRes.status})`);
  }
  return Buffer.from(await fileRes.arrayBuffer());
};

/**
 * Convert a .docx buffer to a .pdf buffer using whichever strategy is configured.
 * Throws an operational 503 (`PDF_CONVERT_FAILED`) so the reason surfaces to the
 * client exactly as before.
 *
 * @param {Buffer} docxBuffer
 * @returns {Promise<Buffer>} the rendered PDF
 */
const convertDocxToPdf = async (docxBuffer) => {
  const remote = isRemoteConfigured();
  try {
    return remote
      ? await convertRemote(docxBuffer)
      : await convertLocal(docxBuffer, '.pdf', undefined);
  } catch (err) {
    logger.error(
      `[pdf] ${remote ? 'CloudConvert' : 'local LibreOffice'} conversion failed: ${err.message}`
    );
    throw ApiError.serviceUnavailable(MESSAGES.PDF_CONVERT_FAILED);
  }
};

module.exports = { convertDocxToPdf, isRemoteConfigured };
