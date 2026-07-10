'use strict';

const { slugify } = require('./text');

/**
 * Generate a slug from `source` that is unique for the given Mongoose model.
 * Appends -1, -2, ... on collision. Pass `excludeId` on updates so a document
 * doesn't collide with itself.
 *
 * @param {import('mongoose').Model} Model
 * @param {string} source
 * @param {{ excludeId?: string, fallback?: string }} [options]
 */
const generateUniqueSlug = async (Model, source, { excludeId, fallback = 'item' } = {}) => {
  const base = slugify(source) || fallback;
  let slug = base;
  let suffix = 1;

  // eslint-disable-next-line no-await-in-loop
  while (await Model.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
};

module.exports = { generateUniqueSlug };
