'use strict';

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const roleService = require('../services/role.service');
const { MESSAGES } = require('../constants');

/** GET /api/v1/roles — list with search and pagination. */
const list = asyncHandler(async (req, res) => {
  const { items, meta } = await roleService.getRoles(req.query);
  return ApiResponse.ok(res, items, MESSAGES.ROLES_FETCHED, meta);
});

/** GET /api/v1/roles/:id */
const getById = asyncHandler(async (req, res) => {
  const role = await roleService.getRoleById(req.params.id);
  return ApiResponse.ok(res, role, MESSAGES.ROLE_FETCHED);
});

/** POST /api/v1/roles */
const create = asyncHandler(async (req, res) => {
  const role = await roleService.createRole(req.body);
  return ApiResponse.created(res, role, MESSAGES.ROLE_CREATED);
});

/** PATCH /api/v1/roles/:id */
const update = asyncHandler(async (req, res) => {
  const role = await roleService.updateRole(req.params.id, req.body);
  return ApiResponse.ok(res, role, MESSAGES.ROLE_UPDATED);
});

/** DELETE /api/v1/roles/:id */
const remove = asyncHandler(async (req, res) => {
  const role = await roleService.deleteRole(req.params.id);
  return ApiResponse.ok(res, { id: role._id }, MESSAGES.ROLE_DELETED);
});

module.exports = { list, getById, create, update, remove };
