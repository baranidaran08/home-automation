'use strict';

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const productService = require('../services/product.service');
const { MESSAGES } = require('../constants');

/** GET /api/products — list with search, filters and pagination. */
const list = asyncHandler(async (req, res) => {
  const { items, meta } = await productService.getProducts(req.query);
  return ApiResponse.ok(res, items, MESSAGES.PRODUCTS_FETCHED, meta);
});

/** GET /api/products/brands — distinct brands for filtering. */
const brands = asyncHandler(async (_req, res) => {
  const data = await productService.getBrands();
  return ApiResponse.ok(res, data, MESSAGES.BRANDS_FETCHED);
});

/** GET /api/products/:id */
const getById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  return ApiResponse.ok(res, product, MESSAGES.PRODUCT_FETCHED);
});

/** POST /api/products (multipart: images[]) */
const create = asyncHandler(async (req, res) => {
  const product = await productService.createProduct({ data: req.body, files: req.files || [] });
  return ApiResponse.created(res, product, MESSAGES.PRODUCT_CREATED);
});

/** PATCH /api/products/:id (multipart: images[] + removeImages) */
const update = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, {
    data: req.body,
    files: req.files || [],
  });
  return ApiResponse.ok(res, product, MESSAGES.PRODUCT_UPDATED);
});

/** DELETE /api/products/:id */
const remove = asyncHandler(async (req, res) => {
  const product = await productService.deleteProduct(req.params.id);
  return ApiResponse.ok(res, { id: product._id }, MESSAGES.PRODUCT_DELETED);
});

module.exports = { list, brands, getById, create, update, remove };
