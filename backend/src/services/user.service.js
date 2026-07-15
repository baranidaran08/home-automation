'use strict';

const User = require('../models/user.model');
const Role = require('../models/role.model');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { escapeRegExp } = require('../utils/text');
const { resolvePagination, buildPaginationMeta } = require('../utils/pagination');
const emailService = require('./email.service');
const { generateTemporaryPassword } = require('../utils/password');
const { MESSAGES } = require('../constants');

/**
 * User domain logic. Users are RBAC accounts, each linked to exactly one Role.
 * Passwords are hashed by the model's pre-save hook, so we always go through a
 * document `.save()` (never a raw update) when a password is involved.
 *
 * Safety rails (all enforced here — the backend is the source of truth):
 *  - a user cannot delete their own account;
 *  - the last Super Admin cannot be removed or demoted;
 *  - the seeded Root Super Admin (`isRoot`) is fully protected — it cannot be
 *    deleted, its role cannot be changed, and only its owner may edit sensitive
 *    fields (email/password); other admins are limited to safe fields (name).
 */

const POPULATE = { path: 'role', select: 'name isSuperAdmin isSystem' };

/** Case-insensitive duplicate-email guard. Optionally exclude a document. */
const assertEmailIsUnique = async (email, excludeId) => {
  const query = { email: email.toLowerCase() };
  if (excludeId) query._id = { $ne: excludeId };

  const existing = await User.findOne(query).lean();
  if (existing) {
    throw ApiError.conflict(MESSAGES.USER_DUPLICATE);
  }
};

/** Resolve a role id to its document or throw 400. */
const getRoleOrFail = async (roleId) => {
  const role = await Role.findById(roleId);
  if (!role) {
    throw ApiError.badRequest(MESSAGES.USER_ROLE_REQUIRED);
  }
  return role;
};

/** Count how many users currently hold a Super Admin role. */
const countSuperAdmins = async () => {
  const superRoles = await Role.find({ isSuperAdmin: true }).select('_id').lean();
  const ids = superRoles.map((r) => r._id);
  if (ids.length === 0) return 0;
  return User.countDocuments({ role: { $in: ids } });
};

/** Fetch a user (role populated) or throw 404. */
const findByIdOrFail = async (id) => {
  const user = await User.findById(id).populate(POPULATE);
  if (!user) {
    throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
  }
  return user;
};

const createUser = async ({ name, email, role }) => {
  await assertEmailIsUnique(email);
  const roleDoc = await getRoleOrFail(role);

  // The backend mints the first password — never a human. It exists as plaintext
  // only inside this function: long enough to be hashed on save and emailed to the
  // employee, then it is discarded when the function returns. `mustChangePassword`
  // forces the employee to replace it on first login (enforced by `authorize`).
  const temporaryPassword = generateTemporaryPassword();

  const user = new User({
    name,
    email,
    password: temporaryPassword,
    role,
    mustChangePassword: true,
  });
  await user.save(); // pre-save hook hashes the temporary password

  // Best-effort welcome email carrying the temporary password. Fire-and-forget:
  // we do NOT await it, so a slow/blocked SMTP host can never delay (or time out)
  // the API response — the account is already saved. Failures are just logged.
  // We email the plaintext `temporaryPassword`, not `user.password` (now hashed).
  emailService
    .sendWelcomeEmail({
      name: user.name,
      email: user.email,
      password: temporaryPassword,
      roleName: roleDoc.name,
    })
    .then(() => logger.info(`[user] Welcome email queued for ${user.email}`))
    .catch((err) => logger.error(`[user] Welcome email failed for ${user.email}: ${err.message}`));

  return user.populate(POPULATE);
};

// Fields another administrator is allowed to change on the Root account. The
// Root owner may additionally change their own email/password; nobody may change
// the Root's role. Everything is enforced here, in the backend.
const ROOT_FIELDS_EDITABLE_BY_OTHERS = new Set(['name']);

/**
 * Enforce Root Super Admin protection on an update. Throws 403 with a clear
 * message when a protected field is touched. `isSelf` = the Root editing itself.
 */
const assertRootUpdateAllowed = (user, updates, isSelf) => {
  if (!user.isRoot) return;

  // The Root's role can never change — not even by the Root themselves.
  const roleChanged =
    updates.role !== undefined && String(updates.role) !== String(user.role?._id ?? user.role);
  if (roleChanged) {
    throw ApiError.forbidden(MESSAGES.ROOT_ROLE_LOCKED);
  }

  // Only the Root owner may edit sensitive profile fields (email/password).
  // Other administrators are limited to safe fields (name).
  if (!isSelf) {
    const emailChanged = updates.email !== undefined && updates.email !== user.email;
    const passwordChanged = updates.password !== undefined && updates.password !== '';
    const touchesUnsafe =
      emailChanged ||
      passwordChanged ||
      Object.keys(updates).some(
        (k) => !ROOT_FIELDS_EDITABLE_BY_OTHERS.has(k) && k !== 'role' // role handled above
      );
    if (touchesUnsafe) {
      throw ApiError.forbidden(MESSAGES.ROOT_EDIT_BLOCKED);
    }
  }
};

const updateUser = async (id, updates, currentUserId) => {
  const user = await findByIdOrFail(id);
  const wasSuperAdmin = !!user.role?.isSuperAdmin;

  // Root Super Admin protection (backend is the source of truth).
  assertRootUpdateAllowed(user, updates, String(user._id) === String(currentUserId));

  if (updates.email !== undefined && updates.email !== user.email) {
    await assertEmailIsUnique(updates.email, user._id);
    user.email = updates.email;
  }
  if (updates.name !== undefined) user.name = updates.name;

  if (updates.role !== undefined && String(updates.role) !== String(user.role?._id ?? user.role)) {
    const newRole = await getRoleOrFail(updates.role);
    // Guard: don't demote the last remaining Super Admin.
    if (wasSuperAdmin && !newRole.isSuperAdmin && (await countSuperAdmins()) <= 1) {
      throw ApiError.badRequest(MESSAGES.USER_LAST_SUPER_ADMIN);
    }
    user.role = newRole._id;
  }

  if (updates.password !== undefined) user.password = updates.password; // re-hashed on save

  await user.save();
  return user.populate(POPULATE);
};

const deleteUser = async (id, currentUserId) => {
  const user = await findByIdOrFail(id);

  // The Root Super Admin can never be deleted — by anyone, including itself.
  if (user.isRoot) {
    throw ApiError.forbidden(MESSAGES.ROOT_DELETE_BLOCKED);
  }

  if (String(user._id) === String(currentUserId)) {
    throw ApiError.badRequest(MESSAGES.USER_SELF_DELETE);
  }

  if (user.role?.isSuperAdmin && (await countSuperAdmins()) <= 1) {
    throw ApiError.badRequest(MESSAGES.USER_LAST_SUPER_ADMIN);
  }

  await user.deleteOne();
  return user;
};

const getUserById = async (id) => findByIdOrFail(id);

/** List users with search (name/email), optional role filter, and pagination. */
const getUsers = async ({ page, limit, search, role } = {}) => {
  const { page: safePage, limit: safeLimit, skip } = resolvePagination({ page, limit });

  const filter = {};
  if (role) filter.role = role;
  if (search) {
    const rx = { $regex: escapeRegExp(search), $options: 'i' };
    filter.$or = [{ name: rx }, { email: rx }];
  }

  const [items, total] = await Promise.all([
    User.find(filter).populate(POPULATE).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    User.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta({ page: safePage, limit: safeLimit, total }) };
};

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  getUsers,
};
