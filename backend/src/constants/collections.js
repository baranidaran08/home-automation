'use strict';

/**
 * MongoDB collection names for domain modules that are not implemented yet.
 *
 * These match Mongoose's default pluralised, lowercased collection names, so
 * once the corresponding models are added (`Category`, `Product`, `Template`)
 * they will map to these exact collections and the dashboard will report real
 * data automatically — no changes needed here.
 */
const COLLECTIONS = {
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  TEMPLATES: 'templates',
};

// Field on a product document that holds its stock quantity (summed for totalStock).
const PRODUCT_STOCK_FIELD = 'stock';

module.exports = { COLLECTIONS, PRODUCT_STOCK_FIELD };
