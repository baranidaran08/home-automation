'use strict';

const User = require('../models/user.model');
const Role = require('../models/role.model');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { escapeRegExp } = require('../utils/text');
const { resolvePagination, buildPaginationMeta } = require('../utils/pagination');
const emailService = require('./email.service');
const cloudinaryService = require('./cloudinary.service');
const env = require('../config/env');
const { generateTemporaryPassword } = require('../utils/password');
const { runInBackground } = require('../utils/background');
const { MESSAGES } = require('../constants');

// All profile pictures live in one Cloudinary subfolder.
const AVATAR_FOLDER = `${env.cloudinary.folder}/avatars`;

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
  // `runInBackground` keeps the serverless instance alive until the send
  // settles; without it Vercel may suspend the function on response, freezing
  // the SMTP handshake ("Connection timeout").
  runInBackground(
    emailService
      .sendWelcomeEmail({
        name: user.name,
        email: user.email,
        password: temporaryPassword,
        roleName: roleDoc.name,
      })
      .then(() => logger.info(`[user] Welcome email queued for ${user.email}`))
      .catch((err) => logger.error(`[user] Welcome email failed for ${user.email}: ${err.message}`))
  );

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

/**
 * Apply a profile-picture change to a user document (in place; the caller saves).
 * Uploads a new picture to Cloudinary and clears the previous asset, or removes
 * the picture entirely when `removeAvatar` is set. The old `avatarPublicId` is
 * `select: false`, so it is fetched explicitly to delete the stale Cloudinary
 * asset. A no-op when neither a file nor a remove flag is provided.
 */
const applyAvatarChange = async (user, file, removeAvatar) => {
  if (!file && !removeAvatar) return;

  const current = await User.findById(user._id).select('+avatarPublicId').lean();
  const oldPublicId = current?.avatarPublicId;

  if (file) {
    let uploaded;
    try {
      uploaded = await cloudinaryService.uploadBuffer(file.buffer, AVATAR_FOLDER);
    } catch (err) {
      logger.error(`[user] Avatar upload failed for ${user.email}: ${err.message}`);
      throw ApiError.internal(MESSAGES.IMAGE_UPLOAD_FAILED);
    }
    user.avatarUrl = uploaded.secureUrl;
    user.avatarPublicId = uploaded.publicId;
  } else {
    // removeAvatar with no replacement → clear the picture.
    user.avatarUrl = undefined;
    user.avatarPublicId = undefined;
  }

  // Best-effort cleanup of the previous asset (never blocks the update).
  if (oldPublicId) await cloudinaryService.destroy(oldPublicId);
};

const updateUser = async (id, updates, currentUserId, file) => {
  const user = await findByIdOrFail(id);
  const wasSuperAdmin = !!user.role?.isSuperAdmin;

  // Root Super Admin protection (backend is the source of truth).
  assertRootUpdateAllowed(user, updates, String(user._id) === String(currentUserId));

  // Changing the email is a plain rename of the same account: the password is
  // left completely untouched (only re-hashed when `updates.password` is given),
  // so the user can immediately sign in with the NEW email + their EXISTING
  // password. We deliberately do NOT trigger a reset email here.
  const emailChanged = updates.email !== undefined && updates.email !== user.email;
  if (emailChanged) {
    await assertEmailIsUnique(updates.email, user._id);
    user.email = updates.email;
  }
  if (updates.name !== undefined) user.name = updates.name;
  if (updates.phone !== undefined) user.phone = updates.phone;

  // Profile picture: upload/replace/remove (Cloudinary). `removeAvatar` arrives
  // as a string over multipart, so treat the string 'true' as a request too.
  const removeAvatar = updates.removeAvatar === true || updates.removeAvatar === 'true';
  await applyAvatarChange(user, file, removeAvatar);

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

  // Sever any recorded Google identity when the email changes. The stored
  // `googleId` (the Google `sub`) was bound to the PREVIOUS email; keeping it
  // would (a) leave a stale subject lingering on the sparse-unique index — a
  // duplicate-key hazard if the old email is later reused by a new user signing
  // in with that old Google account — and (b) is unnecessary, because
  // `loginWithGoogle` matches strictly by email and re-records the subject on
  // the next Google sign-in. Net effect (matching the requirement):
  //   - the Google account whose email matches the NEW address authenticates
  //     successfully and re-binds its `googleId`;
  //   - the OLD Google account (old email) no longer matches any user → fails.
  // `$unset` is used (not `save`) so the removal is reliable even though
  // `googleId` is `select: false` and therefore not loaded on the document.
  if (emailChanged) {
    await User.updateOne({ _id: user._id }, { $unset: { googleId: '' } });
  }

  return user.populate(POPULATE);
};

/**
 * Self-service profile update. Identical field/avatar logic as `updateUser`, but
 * scoped to the caller's own account: `currentUserId === userId`, so a Root user
 * editing itself is permitted, and the (role-less) profile validation guarantees
 * role/password are never present. Returns the populated document; the caller
 * serialises it into the session shape.
 */
const updateProfile = async (userId, updates, file) => updateUser(userId, updates, userId, file);

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

  // Best-effort removal of the profile picture asset so deleting a user doesn't
  // orphan its avatar in Cloudinary. `avatarPublicId` is `select: false`.
  const withAsset = await User.findById(id).select('+avatarPublicId').lean();
  if (withAsset?.avatarPublicId) await cloudinaryService.destroy(withAsset.avatarPublicId);

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
  updateProfile,
  deleteUser,
  getUserById,
  getUsers,
};
