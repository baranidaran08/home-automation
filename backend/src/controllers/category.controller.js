'use strict';

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const categoryService = require('../services/category.service');
const { MESSAGES } = require('../constants');

/** GET /api/v1/categories — list with search, status filter and pagination. */
const list = asyncHandler(async (req, res) => {
  const { items, meta } = await categoryService.getCategories(req.query);
  return ApiResponse.ok(res, items, MESSAGES.CATEGORIES_FETCHED, meta);
});

/** GET /api/v1/categories/:id */
const getById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  return ApiResponse.ok(res, category, MESSAGES.CATEGORY_FETCHED);
});

/** POST /api/v1/categories */
const create = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  return ApiResponse.created(res, category, MESSAGES.CATEGORY_CREATED);
});

/** PATCH /api/v1/categories/:id */
const update = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  return ApiResponse.ok(res, category, MESSAGES.CATEGORY_UPDATED);
});

/** DELETE /api/v1/categories/:id */
const remove = asyncHandler(async (req, res) => {
  const category = await categoryService.deleteCategory(req.params.id);
  return ApiResponse.ok(res, { id: category._id }, MESSAGES.CATEGORY_DELETED);
});

module.exports = { list, getById, create, update, remove };
