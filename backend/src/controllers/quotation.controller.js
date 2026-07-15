'use strict';

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const quotationService = require('../services/quotation.service');
const { MESSAGES } = require('../constants');

/** GET /api/quotations */
const list = asyncHandler(async (req, res) => {
  const { items, meta } = await quotationService.getQuotations(req.query);
  return ApiResponse.ok(res, items, MESSAGES.QUOTATIONS_FETCHED, meta);
});

/** GET /api/quotations/:id */
const getById = asyncHandler(async (req, res) => {
  const quotation = await quotationService.getQuotationById(req.params.id);
  return ApiResponse.ok(res, quotation, MESSAGES.QUOTATION_FETCHED);
});

/** POST /api/quotations */
const create = asyncHandler(async (req, res) => {
  const quotation = await quotationService.createQuotation(req.body);
  return ApiResponse.created(res, quotation, MESSAGES.QUOTATION_CREATED);
});

/** PATCH /api/quotations/:id */
const update = asyncHandler(async (req, res) => {
  const quotation = await quotationService.updateQuotation(req.params.id, req.body);
  return ApiResponse.ok(res, quotation, MESSAGES.QUOTATION_UPDATED);
});

/** POST /api/quotations/:id/generate — build the merged PDF. */
const generate = asyncHandler(async (req, res) => {
  const quotation = await quotationService.generateQuotation(req.params.id);
  return ApiResponse.ok(res, quotation, MESSAGES.QUOTATION_GENERATED);
});

/** GET /api/quotations/:id/download — stream the PDF with a proper filename. */
const download = asyncHandler(async (req, res) => {
  const { buffer, filename } = await quotationService.getPdfDownload(req.params.id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', buffer.length);
  return res.send(buffer);
});

module.exports = { list, getById, create, update, generate, download };
