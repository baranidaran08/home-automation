'use strict';

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const templateService = require('../services/template.service');
const { MESSAGES } = require('../constants');

/** GET /api/templates — list with search + category filter + pagination. */
const list = asyncHandler(async (req, res) => {
  const { items, meta } = await templateService.getTemplates(req.query);
  return ApiResponse.ok(res, items, MESSAGES.TEMPLATES_FETCHED, meta);
});

/** GET /api/templates/:id */
const getById = asyncHandler(async (req, res) => {
  const template = await templateService.getTemplateById(req.params.id);
  return ApiResponse.ok(res, template, MESSAGES.TEMPLATE_FETCHED);
});

/** GET /api/templates/:id/download — redirect to a force-download URL. */
const download = asyncHandler(async (req, res) => {
  const url = await templateService.getDownloadUrl(req.params.id);
  return res.redirect(url);
});

/** POST /api/templates (multipart: templateFile = .docx) */
const create = asyncHandler(async (req, res) => {
  const template = await templateService.createTemplate({ data: req.body, file: req.file });
  return ApiResponse.created(res, template, MESSAGES.TEMPLATE_CREATED);
});

/** PATCH /api/templates/:id (multipart: optional templateFile → replace) */
const update = asyncHandler(async (req, res) => {
  const template = await templateService.updateTemplate(req.params.id, {
    data: req.body,
    file: req.file,
  });
  return ApiResponse.ok(res, template, MESSAGES.TEMPLATE_UPDATED);
});

/** DELETE /api/templates/:id */
const remove = asyncHandler(async (req, res) => {
  const template = await templateService.deleteTemplate(req.params.id);
  return ApiResponse.ok(res, { id: template._id }, MESSAGES.TEMPLATE_DELETED);
});

module.exports = { list, getById, download, create, update, remove };
