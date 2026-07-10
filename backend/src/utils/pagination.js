'use strict';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Normalise pagination inputs into safe { page, limit, skip } values.
 * Accepts already-coerced numbers (from Zod) or raw strings.
 */
const resolvePagination = ({ page, limit } = {}) => {
  const safePage = Math.max(DEFAULT_PAGE, parseInt(page, 10) || DEFAULT_PAGE);
  const safeLimit = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10) || DEFAULT_LIMIT));
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
};

/** Build the standard pagination meta object returned to clients. */
const buildPaginationMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
});

module.exports = { resolvePagination, buildPaginationMeta, DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT };
