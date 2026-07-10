'use strict';

const Template = require('../models/template.model');
const Category = require('../models/category.model');
const ApiError = require('../utils/ApiError');
const { escapeRegExp } = require('../utils/text');
const { extractPlaceholders } = require('../utils/docx');
const { resolvePagination, buildPaginationMeta } = require('../utils/pagination');
const cloudinaryService = require('./cloudinary.service');
const logger = require('../utils/logger');
const { MESSAGES, REQUIRED_PLACEHOLDERS } = require('../constants');

const CATEGORY_POPULATE = { path: 'category', select: 'categoryName slug' };
const FILE_RESOURCE_TYPE = 'raw'; // .docx is stored as a Cloudinary "raw" asset

/** Ensure the referenced category exists, else 400. */
const assertCategoryExists = async (categoryId) => {
  const exists = await Category.exists({ _id: categoryId });
  if (!exists) {
    throw ApiError.badRequest(MESSAGES.CATEGORY_NOT_FOUND);
  }
};

/**
 * Enforce the "one category = one template" rule. Throws 409 if a template
 * already exists for the category (optionally excluding the current document).
 */
const assertCategoryFree = async (categoryId, excludeId) => {
  const query = { category: categoryId };
  if (excludeId) query._id = { $ne: excludeId };
  const existing = await Template.exists(query);
  if (existing) {
    throw ApiError.conflict(MESSAGES.TEMPLATE_CATEGORY_EXISTS);
  }
};

/**
 * Read the .docx, extract placeholders and verify all required ones are present.
 * Returns the detected placeholders. Throws 400 for an unreadable file, or 422
 * (with the list of missing tokens) when required placeholders are absent.
 */
const validateAndExtractPlaceholders = (file) => {
  let detected;
  try {
    detected = extractPlaceholders(file.buffer);
  } catch (err) {
    logger.warn(`[template] unreadable .docx "${file.originalname}": ${err.message}`);
    throw ApiError.badRequest(MESSAGES.TEMPLATE_INVALID_DOCX);
  }

  const detectedSet = new Set(detected);
  const missing = REQUIRED_PLACEHOLDERS.filter((name) => !detectedSet.has(name));
  if (missing.length) {
    const pretty = missing.map((name) => `{{${name}}}`);
    throw ApiError.unprocessable(
      `${MESSAGES.TEMPLATE_MISSING_PLACEHOLDERS}: ${pretty.join(', ')}`,
      {
        missing: pretty,
      }
    );
  }
  return detected;
};

const findByIdOrFail = async (id, { populate = false } = {}) => {
  const query = Template.findById(id);
  if (populate) query.populate(CATEGORY_POPULATE);
  const template = await query;
  if (!template) {
    throw ApiError.notFound(MESSAGES.TEMPLATE_NOT_FOUND);
  }
  return template;
};

const createTemplate = async ({ data, file }) => {
  if (!file) {
    throw ApiError.badRequest(MESSAGES.TEMPLATE_FILE_REQUIRED);
  }
  await assertCategoryExists(data.category);
  await assertCategoryFree(data.category);

  // Validate placeholders BEFORE uploading, so invalid templates never reach Cloudinary.
  const placeholders = validateAndExtractPlaceholders(file);
  logger.info(`[template] create "${data.templateName}": ${placeholders.length} placeholder(s) ok`);

  const templateFile = await cloudinaryService.uploadRawFile(file, 'templates');
  const template = await Template.create({
    category: data.category,
    templateName: data.templateName,
    description: data.description ?? '',
    templateFile,
    placeholders,
  });
  return template.populate(CATEGORY_POPULATE);
};

const updateTemplate = async (id, { data, file }) => {
  const template = await findByIdOrFail(id);

  // Moving to another category must not violate the one-per-category rule.
  if (data.category && String(data.category) !== String(template.category)) {
    await assertCategoryExists(data.category);
    await assertCategoryFree(data.category, template._id);
    template.category = data.category;
  }

  if (data.templateName !== undefined) template.templateName = data.templateName;
  if (data.description !== undefined) template.description = data.description;

  // Replace the .docx: validate, upload new, then delete the previous asset.
  if (file) {
    template.placeholders = validateAndExtractPlaceholders(file);
    const oldPublicId = template.templateFile?.publicId;
    template.templateFile = await cloudinaryService.uploadRawFile(file, 'templates');
    if (oldPublicId) {
      await cloudinaryService.destroy(oldPublicId, FILE_RESOURCE_TYPE);
    }
  }

  await template.save();
  return template.populate(CATEGORY_POPULATE);
};

const deleteTemplate = async (id) => {
  const template = await findByIdOrFail(id);
  if (template.templateFile?.publicId) {
    await cloudinaryService.destroy(template.templateFile.publicId, FILE_RESOURCE_TYPE);
  }
  await template.deleteOne();
  return template;
};

const getTemplateById = async (id) => findByIdOrFail(id, { populate: true });

/** Build a force-download URL for a template's .docx file. */
const getDownloadUrl = async (id) => {
  const template = await findByIdOrFail(id);
  return cloudinaryService.toAttachmentUrl(template.templateFile.secureUrl);
};

/** List with search (by template name) + category filter + pagination. */
const getTemplates = async ({ page, limit, search, category } = {}) => {
  const { page: safePage, limit: safeLimit, skip } = resolvePagination({ page, limit });

  const filter = {};
  if (category) filter.category = category;
  if (search) filter.templateName = { $regex: escapeRegExp(search), $options: 'i' };

  const [items, total] = await Promise.all([
    Template.find(filter)
      .populate(CATEGORY_POPULATE)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    Template.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta({ page: safePage, limit: safeLimit, total }) };
};

module.exports = {
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplateById,
  getDownloadUrl,
  getTemplates,
};
