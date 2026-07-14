'use strict';

const Role = require('../models/role.model');
const Permission = require('../models/permission.model');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const { escapeRegExp } = require('../utils/text');
const { resolvePagination, buildPaginationMeta } = require('../utils/pagination');
const { findMissingDependencies } = require('../utils/permission-dependencies');
const { MESSAGES } = require('../constants');

/**
 * Role domain logic. Functions throw `ApiError` and return plain data. System
 * roles (isSystem) are protected: they cannot be renamed or deleted, but their
 * permission set MAY be edited (so, e.g., a Sales Executive can be granted a new
 * capability). `isSuperAdmin`/`isSystem` are never settable through the API.
 */

const POPULATE = { path: 'permissions', select: 'key module action description' };

/** Case-insensitive duplicate-name guard. Optionally exclude a document (updates). */
const assertNameIsUnique = async (name, excludeId) => {
  const query = { name: { $regex: `^${escapeRegExp(name)}$`, $options: 'i' } };
  if (excludeId) query._id = { $ne: excludeId };

  const existing = await Role.findOne(query).lean();
  if (existing) {
    throw ApiError.conflict(MESSAGES.ROLE_DUPLICATE);
  }
};

/**
 * Ensure every supplied permission id refers to a real permission, returning
 * both the ObjectIds (to store) and the permission keys (to validate feature
 * dependencies against).
 */
const resolvePermissions = async (ids = []) => {
  const unique = [...new Set(ids.map(String))];
  if (unique.length === 0) return { ids: [], keys: [] };

  const found = await Permission.find({ _id: { $in: unique } })
    .select('_id key')
    .lean();
  if (found.length !== unique.length) {
    throw ApiError.badRequest(MESSAGES.ROLE_INVALID_PERMISSIONS);
  }
  return { ids: found.map((p) => p._id), keys: found.map((p) => p.key) };
};

/**
 * Reject invalid permission combinations. The dependency engine computes every
 * prerequisite a set requires (read-parents, cross-module reads, the dashboard
 * baseline); if any is absent the role is not saved. This is the server-side
 * source of truth — the frontend's auto-enable is a convenience, not a guard.
 */
const assertDependenciesSatisfied = (keys) => {
  const missing = findMissingDependencies(keys);
  if (missing.length > 0) {
    throw ApiError.badRequest(`${MESSAGES.ROLE_MISSING_DEPENDENCIES}: ${missing.join(', ')}`);
  }
};

/** Fetch a role (permissions populated) or throw 404. */
const findByIdOrFail = async (id) => {
  const role = await Role.findById(id).populate(POPULATE);
  if (!role) {
    throw ApiError.notFound(MESSAGES.ROLE_NOT_FOUND);
  }
  return role;
};

const createRole = async ({ name, description = '', permissions = [] }) => {
  await assertNameIsUnique(name);
  const { ids, keys } = await resolvePermissions(permissions);
  assertDependenciesSatisfied(keys);

  const role = await Role.create({
    name,
    description,
    permissions: ids,
    isSuperAdmin: false,
    isSystem: false,
  });
  return role.populate(POPULATE);
};

const updateRole = async (id, updates) => {
  const role = await findByIdOrFail(id);

  // System roles keep their name but may have description/permissions tuned.
  if (updates.name !== undefined && updates.name !== role.name) {
    if (role.isSystem) {
      throw ApiError.forbidden(MESSAGES.ROLE_SYSTEM_LOCKED);
    }
    await assertNameIsUnique(updates.name, role._id);
    role.name = updates.name;
  }

  if (updates.description !== undefined) role.description = updates.description;

  if (updates.permissions !== undefined) {
    const { ids, keys } = await resolvePermissions(updates.permissions);
    assertDependenciesSatisfied(keys);
    role.permissions = ids;
  }

  await role.save();
  return role.populate(POPULATE);
};

const deleteRole = async (id) => {
  const role = await findByIdOrFail(id);

  if (role.isSystem) {
    throw ApiError.forbidden(MESSAGES.ROLE_SYSTEM_LOCKED);
  }

  // Block deletion while users still reference the role (avoids orphaned users).
  const inUse = await User.countDocuments({ role: role._id });
  if (inUse > 0) {
    throw ApiError.conflict(MESSAGES.ROLE_IN_USE);
  }

  await role.deleteOne();
  return role;
};

const getRoleById = async (id) => findByIdOrFail(id);

/** List roles with search (by name) and pagination; permissions populated. */
const getRoles = async ({ page, limit, search } = {}) => {
  const { page: safePage, limit: safeLimit, skip } = resolvePagination({ page, limit });

  const filter = {};
  if (search) {
    filter.name = { $regex: escapeRegExp(search), $options: 'i' };
  }

  const [items, total] = await Promise.all([
    Role.find(filter)
      .populate(POPULATE)
      .sort({ isSystem: -1, createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    Role.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta({ page: safePage, limit: safeLimit, total }) };
};

module.exports = {
  createRole,
  updateRole,
  deleteRole,
  getRoleById,
  getRoles,
};
