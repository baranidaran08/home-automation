'use strict';

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const userService = require('../services/user.service');
const { MESSAGES } = require('../constants');

/** GET /api/users — list with search, role filter and pagination. */
const list = asyncHandler(async (req, res) => {
  const { items, meta } = await userService.getUsers(req.query);
  return ApiResponse.ok(res, items, MESSAGES.USERS_FETCHED, meta);
});

/** GET /api/users/:id */
const getById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return ApiResponse.ok(res, user, MESSAGES.USER_FETCHED);
});

/** POST /api/users */
const create = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  return ApiResponse.created(res, user, MESSAGES.USER_CREATED);
});

/** PATCH /api/users/:id */
const update = asyncHandler(async (req, res) => {
  // Pass the caller's id so the service can enforce Root Super Admin protection
  // (only the Root owner may edit sensitive fields on the Root account).
  const user = await userService.updateUser(req.params.id, req.body, req.user._id);
  return ApiResponse.ok(res, user, MESSAGES.USER_UPDATED);
});

/** DELETE /api/users/:id */
const remove = asyncHandler(async (req, res) => {
  // Pass the caller's id so the service can block self-deletion.
  const user = await userService.deleteUser(req.params.id, req.user._id);
  return ApiResponse.ok(res, { id: user._id }, MESSAGES.USER_DELETED);
});

module.exports = { list, getById, create, update, remove };
