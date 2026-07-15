'use strict';

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const dashboardService = require('../services/dashboard.service');
const { MESSAGES } = require('../constants');

/**
 * GET /api/dashboard/summary   (protected)
 * Returns aggregate counts for the admin dashboard overview.
 */
const getSummary = asyncHandler(async (_req, res) => {
  const summary = await dashboardService.getSummary();
  return ApiResponse.ok(res, summary, MESSAGES.DASHBOARD_SUMMARY_FETCHED);
});

module.exports = { getSummary };
