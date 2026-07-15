'use strict';

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const permissionService = require('../services/permission.service');
const { MESSAGES } = require('../constants');

/** GET /api/permissions — full catalogue for the role permission matrix. */
const list = asyncHandler(async (_req, res) => {
  const permissions = await permissionService.getPermissions();
  return ApiResponse.ok(res, permissions, MESSAGES.PERMISSIONS_FETCHED);
});

module.exports = { list };
