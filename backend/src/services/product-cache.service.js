'use strict';

const env = require('../config/env');
const cache = require('./cache.service');

/**
 * Product-module cache keys and invalidation. This is the ONLY place that knows
 * how product data is keyed in Redis, keeping product.service.js focused on
 * business logic.
 *
 * Key layout (all under the configured prefix, default "xen:"):
 *   xen:products:list:<params>   → a paginated { items, meta } list result
 *   xen:products:detail:<id>     → a single populated product
 *   xen:products:brands          → the distinct brands array
 */

const PREFIX = `${env.redis.keyPrefix}products:`;
const LIST_PREFIX = `${PREFIX}list:`;
const DETAIL_PREFIX = `${PREFIX}detail:`;
const BRANDS_KEY = `${PREFIX}brands`;
const TTL = env.redis.productTtlSeconds;

// Normalize a query value so equivalent requests map to the same key. Missing
// filters collapse to "*" and casing/whitespace never fragment the cache.
const norm = (value) =>
  value === undefined || value === null || value === '' ? '*' : String(value).trim().toLowerCase();

/** Deterministic key for a list request built from its (validated) query params. */
const listKey = ({ page, limit, search, category, brand, status } = {}) =>
  `${LIST_PREFIX}p=${norm(page)}&l=${norm(limit)}&c=${norm(category)}&b=${norm(brand)}&s=${norm(status)}&q=${norm(search)}`;

const detailKey = (id) => `${DETAIL_PREFIX}${id}`;

module.exports = {
  getList: (params) => cache.get(listKey(params)),
  setList: (params, data) => cache.set(listKey(params), data, TTL),

  getDetail: (id) => cache.get(detailKey(id)),
  setDetail: (id, data) => cache.set(detailKey(id), data, TTL),

  getBrands: () => cache.get(BRANDS_KEY),
  setBrands: (data) => cache.set(BRANDS_KEY, data, TTL),

  /**
   * Invalidate the entire product namespace. Any create/update/delete can change
   * list ordering, pagination, filtered results, brand distinct values and (for
   * update/delete) a specific detail — so clearing everything under the products
   * prefix is the simple, always-correct choice for a read-heavy catalog. Prevents
   * stale reads without tracking which individual keys were affected.
   */
  invalidate: () => cache.delByPattern(`${PREFIX}*`),
};
