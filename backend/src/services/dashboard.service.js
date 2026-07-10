'use strict';

const mongoose = require('mongoose');
const { COLLECTIONS, PRODUCT_STOCK_FIELD } = require('../constants');
const logger = require('../utils/logger');

/**
 * Dashboard domain logic.
 *
 * Counts are read directly from the underlying collections by name rather than
 * from Mongoose models. This keeps the dashboard decoupled from modules that do
 * not exist yet: `countDocuments` on a not-yet-created collection simply returns
 * 0, and the moment the Categories/Products/Templates modules start writing
 * data, these numbers reflect it — no hardcoded values, no changes required here.
 */

/** Handle to the raw native DB, or null if the connection isn't ready. */
const getDb = () => mongoose.connection?.db ?? null;

/** Count documents in a collection; resolves to 0 if it doesn't exist yet or on error. */
const safeCount = async (collectionName) => {
  const db = getDb();
  if (!db) return 0;
  try {
    return await db.collection(collectionName).countDocuments();
  } catch (err) {
    logger.warn(`[dashboard] count failed for "${collectionName}": ${err.message}`);
    return 0;
  }
};

/** Sum the stock field across all products; resolves to 0 if none/absent. */
const safeStockSum = async () => {
  const db = getDb();
  if (!db) return 0;
  try {
    const [result] = await db
      .collection(COLLECTIONS.PRODUCTS)
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: [`$${PRODUCT_STOCK_FIELD}`, 0] } },
          },
        },
      ])
      .toArray();
    return result?.total ?? 0;
  } catch (err) {
    logger.warn(`[dashboard] stock sum failed: ${err.message}`);
    return 0;
  }
};

/**
 * Build the dashboard summary. All metrics are fetched concurrently.
 * @returns {Promise<{ totalCategories: number, totalProducts: number, totalTemplates: number, totalStock: number }>}
 */
const getSummary = async () => {
  const [totalCategories, totalProducts, totalTemplates, totalStock] = await Promise.all([
    safeCount(COLLECTIONS.CATEGORIES),
    safeCount(COLLECTIONS.PRODUCTS),
    safeCount(COLLECTIONS.TEMPLATES),
    safeStockSum(),
  ]);

  return { totalCategories, totalProducts, totalTemplates, totalStock };
};

module.exports = { getSummary };
