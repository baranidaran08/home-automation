'use strict';

const Product = require('../models/product.model');
const Category = require('../models/category.model');
const ApiError = require('../utils/ApiError');
const { escapeRegExp } = require('../utils/text');
const { generateUniqueSlug } = require('../utils/uniqueSlug');
const { resolvePagination, buildPaginationMeta } = require('../utils/pagination');
const cloudinaryService = require('./cloudinary.service');
const logger = require('../utils/logger');
const { MESSAGES } = require('../constants');

const CATEGORY_POPULATE = { path: 'category', select: 'categoryName slug status' };

/** Ensure the referenced category exists, else 400. */
const assertCategoryExists = async (categoryId) => {
  const exists = await Category.exists({ _id: categoryId });
  if (!exists) {
    throw ApiError.badRequest(MESSAGES.CATEGORY_NOT_FOUND);
  }
};

/** Fetch a product (optionally populated) or throw 404. */
const findByIdOrFail = async (id, { populate = false } = {}) => {
  const query = Product.findById(id);
  if (populate) query.populate(CATEGORY_POPULATE);
  const product = await query;
  if (!product) {
    throw ApiError.notFound(MESSAGES.PRODUCT_NOT_FOUND);
  }
  return product;
};

const createProduct = async ({ data, files = [] }) => {
  await assertCategoryExists(data.category);

  const slug = await generateUniqueSlug(Product, data.productName, { fallback: 'product' });
  // Upload images first so we never persist a product referencing failed uploads.
  logger.info(`[product] create "${data.productName}": received ${files.length} image file(s)`);
  const images = await cloudinaryService.uploadMany(files, 'products');
  logger.info(
    `[product] create "${data.productName}": uploaded ${images.length} image(s) to Cloudinary`
  );

  const product = await Product.create({
    productName: data.productName,
    category: data.category,
    brand: data.brand ?? '',
    modelNumber: data.modelNumber ?? '',
    description: data.description ?? '',
    specifications: data.specifications ?? '',
    warranty: data.warranty ?? '',
    price: data.price,
    stock: data.stock ?? 0,
    status: data.status,
    images,
    slug,
  });

  return product.populate(CATEGORY_POPULATE);
};

const updateProduct = async (id, { data, files = [] }) => {
  const product = await findByIdOrFail(id);
  const { removeImages, ...fields } = data;

  if (fields.category) {
    await assertCategoryExists(fields.category);
  }

  if (fields.productName && fields.productName !== product.productName) {
    product.slug = await generateUniqueSlug(Product, fields.productName, {
      excludeId: product._id,
      fallback: 'product',
    });
  }

  // Simple scalar fields.
  const SCALARS = [
    'productName',
    'category',
    'brand',
    'modelNumber',
    'description',
    'specifications',
    'warranty',
    'price',
    'stock',
    'status',
  ];
  SCALARS.forEach((key) => {
    if (fields[key] !== undefined) product[key] = fields[key];
  });

  // Remove requested images (from DB + Cloudinary).
  if (Array.isArray(removeImages) && removeImages.length) {
    const toRemove = new Set(removeImages);
    product.images = product.images.filter((img) => !toRemove.has(img.publicId));
    await cloudinaryService.destroyMany(removeImages);
  }

  // Append newly uploaded images.
  if (files.length) {
    logger.info(`[product] update ${id}: received ${files.length} new image file(s)`);
    const uploaded = await cloudinaryService.uploadMany(files, 'products');
    product.images.push(...uploaded);
  }

  await product.save();
  return product.populate(CATEGORY_POPULATE);
};

const deleteProduct = async (id) => {
  const product = await findByIdOrFail(id);
  // Best-effort cleanup of Cloudinary assets before removing the document.
  await cloudinaryService.destroyMany(product.images.map((img) => img.publicId));
  await product.deleteOne();
  return product;
};

const getProductById = async (id) => findByIdOrFail(id, { populate: true });

/** List with search (name/brand/model), category/brand/status filters + pagination. */
const getProducts = async ({ page, limit, search, category, brand, status } = {}) => {
  const { page: safePage, limit: safeLimit, skip } = resolvePagination({ page, limit });

  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (brand) filter.brand = { $regex: `^${escapeRegExp(brand)}$`, $options: 'i' };
  if (search) {
    const rx = { $regex: escapeRegExp(search), $options: 'i' };
    filter.$or = [{ productName: rx }, { brand: rx }, { modelNumber: rx }];
  }

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate(CATEGORY_POPULATE)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    Product.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta({ page: safePage, limit: safeLimit, total }) };
};

/** Distinct non-empty brands (for the brand filter dropdown). */
const getBrands = async () => {
  const brands = await Product.distinct('brand', { brand: { $nin: ['', null] } });
  return brands.sort((a, b) => a.localeCompare(b));
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getBrands,
};
