'use strict';

/**
 * Convert an arbitrary string into a URL-friendly slug.
 * e.g. "Curtain Automation!" -> "curtain-automation"
 */
const slugify = (input) =>
  String(input)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents/diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // drop non-alphanumerics
    .replace(/[\s_-]+/g, '-') // collapse whitespace/underscores to a single dash
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes

/** Escape a string so it can be used literally inside a RegExp (safe search). */
const escapeRegExp = (input) => String(input).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { slugify, escapeRegExp };
