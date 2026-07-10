'use strict';

const AdmZip = require('adm-zip');

// A .docx is a ZIP; its text lives in these XML parts (body + headers/footers).
const TEXT_PART_RE = /^word\/(document|header\d*|footer\d*)\.xml$/i;
// Matches {{ placeholder_name }} tokens (letters, digits, underscore).
const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/**
 * Extract the distinct placeholder names (without braces) from a .docx buffer.
 *
 * Word frequently splits a run like `{{customer_name}}` across multiple XML
 * elements, so we strip all tags first to rejoin the text before matching.
 *
 * @param {Buffer} buffer - the in-memory .docx file
 * @returns {string[]} distinct placeholder names, e.g. ['customer_name', ...]
 * @throws {Error} if the buffer is not a readable ZIP/.docx
 */
const extractPlaceholders = (buffer) => {
  const zip = new AdmZip(buffer); // throws if not a valid zip/.docx

  let text = '';
  for (const entry of zip.getEntries()) {
    if (TEXT_PART_RE.test(entry.entryName)) {
      const xml = zip.readAsText(entry);
      text += xml.replace(/<[^>]+>/g, ''); // drop tags so split runs rejoin
    }
  }

  const found = new Set();
  let match;
  while ((match = PLACEHOLDER_RE.exec(text)) !== null) {
    found.add(match[1]);
  }
  return [...found];
};

module.exports = { extractPlaceholders };
