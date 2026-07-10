'use strict';

const Category = require('../models/category.model');
const ApiError = require('../utils/ApiError');
const { slugify, escapeRegExp } = require('../utils/text');
const { resolvePagination, buildPaginationMeta } = require('../utils/pagination');
const { MESSAGES } = require('../constants');

/**
 * Category domain logic. Functions throw `ApiError` and return plain data;
 * they never touch req/res. Controllers stay thin.
 */

/** Case-insensitive duplicate-name guard. Optionally exclude a document (updates). */
const assertNameIsUnique = async (categoryName, excludeId) => {
  const query = {
    categoryName: { $regex: `^${escapeRegExp(categoryName)}$`, $options: 'i' },
  };
  if (excludeId) query._id = { $ne: excludeId };

  const existing = await Category.findOne(query).lean();
  if (existing) {
    throw ApiError.conflict(MESSAGES.CATEGORY_DUPLICATE);
  }
};

/** Generate a slug that is unique across the collection. */
const generateUniqueSlug = async (name, excludeId) => {
  const base = slugify(name) || 'category';
  let slug = base;
  let suffix = 1;

  // Loop until we find a free slug; excludes the current doc on updates.
  // eslint-disable-next-line no-await-in-loop
  while (await Category.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
};

/** Fetch a category or throw 404. */
const findByIdOrFail = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw ApiError.notFound(MESSAGES.CATEGORY_NOT_FOUND);
  }
  return category;
};

/**
 * Extension point for delete business rules. Today deletion is always allowed;
 * once Products/Templates reference categories, add link checks here (e.g.
 * throw ApiError.conflict if products exist) — no controller changes needed.
 */
// eslint-disable-next-line no-unused-vars
const assertDeletable = async (category) => {
  // Example (future):
  //   const linked = await Product.countDocuments({ category: category._id });
  //   if (linked > 0) throw ApiError.conflict('Category has linked products');
  return true;
};

const createCategory = async ({ categoryName, description = '' }) => {
  await assertNameIsUnique(categoryName);
  const slug = await generateUniqueSlug(categoryName);

  const category = await Category.create({
    categoryName,
    description,
    slug,
  });
  return category;
};

const updateCategory = async (id, updates) => {
  const category = await findByIdOrFail(id);

  if (updates.categoryName && updates.categoryName !== category.categoryName) {
    await assertNameIsUnique(updates.categoryName, category._id);
    category.categoryName = updates.categoryName;
    category.slug = await generateUniqueSlug(updates.categoryName, category._id);
  }
  if (updates.description !== undefined) category.description = updates.description;

  await category.save();
  return category;
};

const deleteCategory = async (id) => {
  const category = await findByIdOrFail(id);
  await assertDeletable(category);
  await category.deleteOne();
  return category;
};

const getCategoryById = async (id) => findByIdOrFail(id);

/**
 * List categories with search (by name) and pagination.
 * @returns {Promise<{ items: object[], meta: object }>}
 */
const getCategories = async ({ page, limit, search } = {}) => {
  const { page: safePage, limit: safeLimit, skip } = resolvePagination({ page, limit });

  const filter = {};
  if (search) {
    filter.categoryName = { $regex: escapeRegExp(search), $options: 'i' };
  }

  const [items, total] = await Promise.all([
    Category.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    Category.countDocuments(filter),
  ]);

  return {
    items,
    meta: buildPaginationMeta({ page: safePage, limit: safeLimit, total }),
  };
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getCategories,
};
